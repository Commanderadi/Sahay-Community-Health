import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api';
import useDebounced from './useDebounced';
import { useAuth } from '../context/AuthContext';

const SORTS = {
  newest: { label: 'Newest first', fn: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) },
  oldest: { label: 'Oldest first', fn: (a, b) => new Date(a.createdAt) - new Date(b.createdAt) },
  'name-asc': { label: 'Name (A–Z)', fn: (a, b) => a.name.localeCompare(b.name) },
  'name-desc': { label: 'Name (Z–A)', fn: (a, b) => b.name.localeCompare(a.name) },
  'city-asc': { label: 'City (A–Z)', fn: (a, b) => a.city.localeCompare(b.city) },
};

export { SORTS };

function errMessage(err, fallback) {
  return err?.response?.data?.error || fallback;
}

export default function useClinics() {
  const { user } = useAuth();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // client-side view controls. `search` is what the input shows; `debouncedSearch`
  // is what actually drives filtering.
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search, 250);
  const [city, setCity] = useState('all');
  const [sort, setSort] = useState('newest');
  const [mineOnly, setMineOnly] = useState(false);

  // Whether the current user may edit/delete a given clinic.
  const canManage = useCallback(
    (clinic) => {
      if (!user) return false;
      if (user.isAdmin) return true;
      if (!clinic.owner) return true; // legacy, unowned
      return String(clinic.owner) === String(user.userId);
    },
    [user],
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/clinics');
      setAll(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(errMessage(err, 'Failed to load clinics.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addClinic = useCallback(async (payload) => {
    const res = await api.post('/api/clinics/add', payload);
    setAll((list) => [res.data, ...list]);
    return res.data;
  }, []);

  const updateClinic = useCallback(async (id, payload) => {
    const res = await api.put(`/api/clinics/${id}`, payload);
    setAll((list) => list.map((c) => (c._id === id ? res.data : c)));
    return res.data;
  }, []);

  const deleteClinic = useCallback(async (id) => {
    await api.delete(`/api/clinics/${id}`);
    setAll((list) => list.filter((c) => c._id !== id));
  }, []);

  const cities = useMemo(() => {
    const set = new Set(all.map((c) => c.city).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [all]);

  const visible = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    let list = all;
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          (c.contact || '').toLowerCase().includes(q),
      );
    }
    if (city !== 'all') {
      list = list.filter((c) => c.city === city);
    }
    if (mineOnly && user) {
      list = list.filter((c) => String(c.owner) === String(user.userId));
    }
    const sorter = (SORTS[sort] || SORTS.newest).fn;
    return [...list].sort(sorter);
  }, [all, debouncedSearch, city, sort, mineOnly, user]);

  return {
    all,
    visible,
    cities,
    loading,
    error,
    total: all.length,
    filtering: search !== debouncedSearch,
    search,
    setSearch,
    city,
    setCity,
    sort,
    setSort,
    mineOnly,
    setMineOnly,
    canManage,
    refetch: fetchAll,
    addClinic,
    updateClinic,
    deleteClinic,
  };
}
