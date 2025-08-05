import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API base URL - supports both Netlify functions and Render backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? (process.env.REACT_APP_USE_RENDER === 'true' 
        ? 'https://sahay-backend.onrender.com' 
        : '/.netlify/functions/api')
    : 'http://localhost:5000');

function ConnectivityTest() {
  const [backendStatus, setBackendStatus] = useState('Testing...');
  const [databaseStatus, setDatabaseStatus] = useState('Testing...');
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    testConnectivity();
  }, []);

  const testConnectivity = async () => {
    try {
      // Test 1: Backend connectivity
      console.log('🔍 Testing backend connectivity...');
      const backendResponse = await axios.get(`${API_BASE_URL}/api/test`);
      setBackendStatus('✅ Connected');
      setTestResults(prev => ({ ...prev, backend: backendResponse.data }));

      // Test 2: Database connectivity (via clinics endpoint)
      console.log('🔍 Testing database connectivity...');
      const dbResponse = await axios.get(`${API_BASE_URL}/api/clinics`);
      setDatabaseStatus(`✅ Connected (${dbResponse.data.length} clinics found)`);
      setTestResults(prev => ({ ...prev, database: { clinicCount: dbResponse.data.length } }));

    } catch (error) {
      console.error('❌ Connectivity test failed:', error);
      if (error.code === 'ECONNREFUSED') {
        setBackendStatus('❌ Backend server not running');
        setDatabaseStatus('❌ Cannot test database (backend down)');
      } else {
        setBackendStatus('❌ Connection failed');
        setDatabaseStatus('❌ Database connection failed');
      }
    }
  };

  return (
    <div className="connectivity-test">
      <h3>🔗 System Connectivity Test</h3>
      
      <div className="test-results">
        <div className="test-item">
          <span className="test-label">Backend Server:</span>
          <span className={`test-status ${backendStatus.includes('✅') ? 'success' : 'error'}`}>
            {backendStatus}
          </span>
        </div>
        
        <div className="test-item">
          <span className="test-label">Database:</span>
          <span className={`test-status ${databaseStatus.includes('✅') ? 'success' : 'error'}`}>
            {databaseStatus}
          </span>
        </div>
      </div>

      {testResults.backend && (
        <div className="test-details">
          <h4>📊 Test Details:</h4>
          <p><strong>Backend Response:</strong> {testResults.backend.message}</p>
          <p><strong>Timestamp:</strong> {testResults.backend.timestamp}</p>
          {testResults.database && (
            <p><strong>Clinics in Database:</strong> {testResults.database.clinicCount}</p>
          )}
        </div>
      )}

      <button onClick={testConnectivity} className="test-button">
        🔄 Re-run Test
      </button>
    </div>
  );
}

export default ConnectivityTest; 