import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import AddClinic from './components/AddClinic';
import ClinicList from './components/ClinicList';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchClinics = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/clinics')
      .then((res) => setClinics(res.data))
      .catch(() => setMessage("❌ Failed to fetch clinics."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClinics();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setUser({ token, role });
    }
  }, []);

  const handleSearch = () => {
    if (!searchQuery) return fetchClinics();
    setLoading(true);
    axios.get(`http://localhost:5000/api/clinics/search?query=${searchQuery}`)
      .then(res => setClinics(res.data))
      .catch(() => setMessage("❌ No results found."))
      .finally(() => setLoading(false));
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setMessage("✅ Logged out successfully");
  };

  return (
    <div className="container">
      <h1>🩺 Sahay – Community Health</h1>

      {message && <div className="message">{message}</div>}

      {user ? (
        <>
          <p>Logged in as: <strong>{user.role}</strong></p>
          <button onClick={logout}>Logout</button>

          <div className="search-bar">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city or name"
            />
            <button onClick={handleSearch}>Search</button>
          </div>

          {user.role !== 'Visitor' && (
            <AddClinic onClinicAdded={fetchClinics} setMessage={setMessage} />
          )}

          {loading ? (
            <p>Loading clinics...</p>
          ) : (
            <ClinicList clinics={clinics} onDelete={fetchClinics} role={user.role} setMessage={setMessage} />
          )}
        </>
      ) : (
        <>
          {showRegister ? (
            <>
              <Register onRegistered={() => setShowRegister(false)} />
              <p>Already have an account? <button onClick={() => setShowRegister(false)}>Login here</button></p>
            </>
          ) : (
            <>
              <Login onLogin={setUser} />
              <p>Don’t have an account? <button onClick={() => setShowRegister(true)}>Register here</button></p>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
