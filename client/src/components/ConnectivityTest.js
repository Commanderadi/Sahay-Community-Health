import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

function ConnectivityTest() {
  const [backendStatus, setBackendStatus] = useState('Testing...');
  const [databaseStatus, setDatabaseStatus] = useState('Testing...');
  const [details, setDetails] = useState(null);

  const testConnectivity = useCallback(async () => {
    setBackendStatus('Testing...');
    setDatabaseStatus('Testing...');
    setDetails(null);

    try {
      const backend = await api.get('/api/test');
      setBackendStatus('✅ Connected');
      setDetails(backend.data);

      const db = await api.get('/api/clinics');
      setDatabaseStatus(`✅ Connected (${db.data.length} clinics found)`);
    } catch (error) {
      setBackendStatus('❌ Connection failed');
      setDatabaseStatus('❌ Database connection failed');
    }
  }, []);

  useEffect(() => {
    testConnectivity();
  }, [testConnectivity]);

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

      {details && (
        <div className="test-details">
          <h4>📊 Test Details:</h4>
          <p><strong>Backend Response:</strong> {details.message}</p>
          <p><strong>Timestamp:</strong> {details.timestamp}</p>
        </div>
      )}

      <button onClick={testConnectivity} className="test-button" aria-label="Re-run connectivity test">
        🔄 Re-run Test
      </button>
    </div>
  );
}

export default ConnectivityTest;
