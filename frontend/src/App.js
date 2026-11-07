import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [alertData, setAlertData] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [resolution, setResolution] = useState('');
  const [rootCause, setRootCause] = useState('');

  // Mock Alert Payload
  const triggerMockAlert = async () => {
    setLoading(true);
    const mockAlert = {
      alertDetails: {
        message: "API latency > 5000ms and HTTP 500 spikes on /api/checkout",
        severity: "CRITICAL"
      },
      logs: "ERROR: Timeout waiting for a connection from pool. Max connections reached.\nWARN: Deployment v2.4.1 finished 5 minutes ago."
    };
    
    setAlertData(mockAlert);

    try {
      const res = await axios.post('http://localhost:5000/api/alert', mockAlert);
      setAnalysis(res.data.analysis);
    } catch (error) {
      console.error(error);
      setAnalysis("Error connecting to IncidentIQ backend. Is the server running on port 5000?");
    }
    setLoading(false);
  };

  const submitResolution = async () => {
    if (!rootCause || !resolution) return alert("Fill in root cause and resolution");
    
    try {
      await axios.post('http://localhost:5000/api/resolve', {
        alertMessage: alertData.alertDetails.message,
        rootCause,
        resolution
      });
      alert("Resolution successfully committed to Hindsight Memory!");
      setAlertData(null);
      setAnalysis('');
      setRootCause('');
      setResolution('');
    } catch (error) {
      console.error(error);
      alert("Failed to save resolution.");
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>IncidentIQ <span>_AIOps Dashboard</span></h1>
        <button onClick={triggerMockAlert} className="trigger-btn">Simulate Incoming Alert</button>
      </header>

      <main className="dashboard">
        <section className="panel raw-data-panel">
          <h2>Incoming Telemetry</h2>
          {alertData ? (
            <div className="data-box">
              <span className="badge critical">{alertData.alertDetails.severity}</span>
              <h3>{alertData.alertDetails.message}</h3>
              <h4>System Logs</h4>
              <pre className="log-viewer">{alertData.logs}</pre>
            </div>
          ) : (
            <p className="placeholder">Waiting for incoming alerts... Click the button above to simulate one.</p>
          )}
        </section>

        <section className="panel ai-panel">
          <h2>Hindsight Analysis</h2>
          {loading ? (
            <div className="loader">Analyzing logs and querying Hindsight memory...</div>
          ) : analysis ? (
            <div className="analysis-content">
              <div className="ai-text">{analysis}</div>
              
              <div className="resolution-box">
                <h3>Engineer Resolution</h3>
                <input 
                  type="text" 
                  placeholder="Confirmed Root Cause (e.g., DB Connection Leak)"
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                />
                <textarea 
                  placeholder="Steps taken to fix..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                ></textarea>
                <button onClick={submitResolution} className="resolve-btn">Save to Hindsight Memory</button>
              </div>
            </div>
          ) : (
            <p className="placeholder">AI idle. System standing by.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;