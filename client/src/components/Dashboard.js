import { lazy, Suspense, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Building2,
  Download,
  LayoutGrid,
  LogOut,
  Map as MapIcon,
  Plus,
  Search,
  Shield,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useClinics, { SORTS } from '../hooks/useClinics';
import { clinicsToCsv, downloadCsv } from '../lib/csv';
import Button from './ui/Button';
import { Select } from './ui/Field';
import { useConfirm } from './ui/ConfirmDialog';
import ClinicCard from './ClinicCard';
import ClinicFormModal from './ClinicFormModal';
import ClinicDetail from './ClinicDetail';
import AdminPanel from './AdminPanel';
import StatusPill from './StatusPill';
import ThemeToggle from './ThemeToggle';

// Leaflet / react-leaflet are ESM-only and heavy — load them on demand.
const MapView = lazy(() => import('./MapView'));

export default function Dashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const { confirm, element: confirmElement } = useConfirm();
  const {
    visible,
    cities,
    loading,
    error,
    total,
    search,
    setSearch,
    city,
    setCity,
    sort,
    setSort,
    mineOnly,
    setMineOnly,
    canManage,
    addClinic,
    updateClinic,
    deleteClinic,
  } = useClinics();

  const [view, setView] = useState('grid'); // 'grid' | 'map'
  const [showFilters, setShowFilters] = useState(false);
  const [formFor, setFormFor] = useState(undefined); // undefined=closed, null=add, clinic=edit
  const [detailFor, setDetailFor] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const activeFilters =
    (city !== 'all' ? 1 : 0) + (sort !== 'newest' ? 1 : 0) + (mineOnly ? 1 : 0);

  const handleDelete = async (clinic) => {
    const ok = await confirm({
      title: 'Delete this clinic?',
      message: `“${clinic.name}” in ${clinic.city} will be permanently removed. This cannot be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteClinic(clinic._id);
      toast.success(`${clinic.name} deleted.`);
      setDetailFor(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete clinic.');
    }
  };

  const submitForm = async (payload) => {
    if (formFor) {
      await updateClinic(formFor._id, payload);
    } else {
      await addClinic(payload);
    }
  };

  const exportCsv = () => {
    downloadCsv(`sahay-clinics-${new Date().toISOString().slice(0, 10)}.csv`, clinicsToCsv(visible));
    toast.success(`Exported ${visible.length} clinics.`);
  };

  return (
    <div className="min-h-screen">
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none text-slate-900 dark:text-white">Sahay</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Clinic directory</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusPill />
            <ThemeToggle />
            {user?.isAdmin && (
              <Button variant="ghost" size="icon" onClick={() => setShowAdmin(true)} aria-label="Manage users">
                <Shield className="h-4 w-4" />
              </Button>
            )}
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 py-1 pl-3 pr-1 dark:border-slate-800 sm:flex">
              <span className="max-w-[12rem] truncate text-xs text-slate-500 dark:text-slate-400">
                {user?.email || 'Signed in'}
              </span>
              <span className="rounded-lg bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                {user?.role || '—'}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => logout()} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.header>

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
        className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Clinics
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {loading
                ? 'Loading…'
                : `${visible.length} of ${total} ${total === 1 ? 'clinic' : 'clinics'}`}
              {!loading && (search || activeFilters > 0) && ' matching your filters'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={exportCsv} disabled={loading || visible.length === 0}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button onClick={() => setFormFor(null)}>
              <Plus className="h-4 w-4" /> Add clinic
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, city or contact…"
              className="input pl-9 pr-9"
              aria-label="Search clinics"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1 dark:border-slate-800">
            <button
              onClick={() => setView('grid')}
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition ${
                view === 'grid'
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              aria-pressed={view === 'grid'}
            >
              <LayoutGrid className="h-4 w-4" /> Grid
            </button>
            <button
              onClick={() => setView('map')}
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition ${
                view === 'map'
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              aria-pressed={view === 'map'}
            >
              <MapIcon className="h-4 w-4" /> Map
            </button>
          </div>

          <Button variant="secondary" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilters > 0 && (
              <span className="ml-0.5 rounded-full bg-brand-600 px-1.5 text-xs font-semibold text-white">
                {activeFilters}
              </span>
            )}
          </Button>
        </div>

        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="card mb-6 grid gap-4 p-4 sm:grid-cols-3">
                <Select label="Filter by city" value={city} onChange={(e) => setCity(e.target.value)}>
                  <option value="all">All cities</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
                <Select label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)}>
                  {Object.entries(SORTS).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
                <label className="flex items-end pb-2.5">
                  <span className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={mineOnly}
                      onChange={(e) => setMineOnly(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
                    />
                    Only clinics I added
                  </span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error ? (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card h-48 animate-pulse bg-slate-100 dark:bg-slate-900" />
            ))}
          </div>
        ) : view === 'map' ? (
          <Suspense
            fallback={
              <div className="card h-[65vh] animate-pulse bg-slate-100 dark:bg-slate-900" />
            }
          >
            <MapView clinics={visible} onOpen={setDetailFor} />
          </Suspense>
        ) : visible.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {total === 0 ? 'No clinics yet' : 'No matches'}
            </h3>
            <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
              {total === 0
                ? 'Add the first clinic to get the directory started.'
                : 'Try a different search term or clear your filters.'}
            </p>
            {total === 0 && (
              <Button className="mt-2" onClick={() => setFormFor(null)}>
                <Plus className="h-4 w-4" /> Add clinic
              </Button>
            )}
          </div>
        ) : (
          <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visible.map((clinic, i) => (
                <ClinicCard
                  key={clinic._id}
                  index={i}
                  clinic={clinic}
                  canManage={canManage(clinic)}
                  onOpen={setDetailFor}
                  onEdit={setFormFor}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.main>

      <ClinicFormModal
        open={formFor !== undefined}
        clinic={formFor || null}
        onClose={() => setFormFor(undefined)}
        onSubmit={submitForm}
      />
      <ClinicDetail
        clinic={detailFor}
        canManage={detailFor ? canManage(detailFor) : false}
        onClose={() => setDetailFor(null)}
        onEdit={(c) => {
          setDetailFor(null);
          setFormFor(c);
        }}
        onDelete={handleDelete}
      />
      <AdminPanel open={showAdmin} onClose={() => setShowAdmin(false)} />
      {confirmElement}
    </div>
  );
}
