import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import AddClinic from './components/AddClinic';
import ClinicList from './components/ClinicList';
import ConnectivityTest from './components/ConnectivityTest';
import './index.css';

// API base URL - supports both Netlify functions and Render backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? (process.env.REACT_APP_USE_RENDER === 'true' 
        ? 'https://sahay-backend.onrender.com' 
        : '/.netlify/functions/api')
    : 'http://localhost:5000');

function App() {
  const [user, setUser] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchClinics = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/clinics`)
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
    axios.get(`${API_BASE_URL}/api/clinics/search?query=${searchQuery}`)
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
              <span className="role-badge">{user.role}</span>
            </div>
            <button className="logout-btn" onClick={logout}>
              🚪 Logout
            </button>
          </div>

          {/* Connectivity Test - Shows backend-frontend connection */}
          <ConnectivityTest />

          <div className="search-bar">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search by city or clinic name..."
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}>
              🔍 Search
            </button>
          </div>

          {user.role !== 'Visitor' && (
            <AddClinic onClinicAdded={fetchClinics} setMessage={setMessage} />
          )}

          {loading ? (
            <div className="loading">
              Loading clinics...
            </div>
          ) : (
            <ClinicList clinics={clinics} onDelete={fetchClinics} role={user.role} setMessage={setMessage} />
          )}
        </>
      ) : (
        <>
          {showRegister ? (
            <>
              <Register onRegistered={() => setShowRegister(false)} />
              <div className="toggle-form">
                <p>Already have an account?</p>
                <button onClick={() => setShowRegister(false)}>Login here</button>
              </div>
            </>
          ) : (
            <>
              <Login onLogin={setUser} />
              <div className="toggle-form">
                <p>Don't have an account?</p>
                <button onClick={() => setShowRegister(true)}>Register here</button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
