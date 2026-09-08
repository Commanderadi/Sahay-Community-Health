import React, { useEffect, useState } from 'react';
import api from './api';
import Login from './components/Login';
import Register from './components/Register';
import AddClinic from './components/AddClinic';
import ClinicList from './components/ClinicList';
import ConnectivityTest from './components/ConnectivityTest';
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
    api.get('/api/clinics')
      .then((res) => setClinics(res.data))
      .catch(() => setMessage('❌ Failed to fetch clinics.'))
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
    if (!searchQuery.trim()) return fetchClinics();
    setLoading(true);
    api.get('/api/clinics/search', { params: { query: searchQuery.trim() } })
      .then((res) => setClinics(res.data))
      .catch(() => setMessage('❌ No results found.'))
      .finally(() => setLoading(false));
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setMessage('✅ Logged out successfully');
  };

  return (
    <div className="container">
      <h1>🩺 Sahay – Community Health</h1>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {user ? (
        <>
          <div className="user-info">
            <div className="user-details">
              <span>👤 Logged in as:</span>
              <span className="role-badge" aria-label={`User role: ${user.role}`}>{user.role}</span>
            </div>
            <button
              className="logout-btn"
              onClick={logout}
              aria-label="Logout from your account"
            >
              🚪 Logout
            </button>
          </div>

          <ConnectivityTest />

          <div className="search-bar">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search by city or clinic name..."
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              aria-label="Search clinics by city or name"
            />
            <button onClick={handleSearch} aria-label="Search for clinics">
              🔍 Search
            </button>
          </div>

          <AddClinic onClinicAdded={fetchClinics} setMessage={setMessage} />

          {loading ? (
            <div className="loading">Loading clinics...</div>
          ) : (
            <ClinicList
              clinics={clinics}
              onDelete={fetchClinics}
              role={user.role}
              setMessage={setMessage}
            />
          )}
        </>
      ) : (
        <>
          {showRegister ? (
            <>
              <Register onRegistered={() => setShowRegister(false)} />
              <div className="toggle-form">
                <p>Already have an account?</p>
                <button
                  onClick={() => setShowRegister(false)}
                  aria-label="Switch to login form"
                >
                  Login here
                </button>
              </div>
            </>
          ) : (
            <>
              <Login onLogin={setUser} />
              <div className="toggle-form">
                <p>Don't have an account?</p>
                <button
                  onClick={() => setShowRegister(true)}
                  aria-label="Switch to registration form"
                >
                  Register here
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
