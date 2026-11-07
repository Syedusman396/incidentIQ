require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { analyzeIncident } = require('./ai');

const app = express();
app.use(cors());
app.use(express.json());

// --- IN-MEMORY DATABASE FOR HACKATHON MVP ---
let hindsightMemoryDB = [];
// --------------------------------------------

// Endpoint 1: Ingest Alert & Trigger AI
app.post('/api/alert', async (req, res) => {
  const { alertDetails, logs } = req.body;
  
  // 1. Search our in-memory "database" for keywords
  // For the demo, we look for "latency" or "500" to match our simulated alert
  const pastIncidents = hindsightMemoryDB.filter(incident => 
    incident.issueSignature.toLowerCase().includes("latency") || 
    incident.issueSignature.toLowerCase().includes("500")
  ).slice(0, 2);

  // 2. Pass context to AI
  try {
    const aiAnalysis = await analyzeIncident(alertDetails, logs, pastIncidents);
    res.json({
      analysis: aiAnalysis,
      hindsightMatches: pastIncidents.length
    });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ analysis: "Failed to generate AI analysis. Check API Key." });
  }
});

// Endpoint 2: Engineer submits resolution to Hindsight memory
app.post('/api/resolve', async (req, res) => {
  const { alertMessage, rootCause, resolution } = req.body;
  
  // Save to our in-memory array
  hindsightMemoryDB.push({
    issueSignature: alertMessage,
    rootCause,
    resolution,
    date: new Date()
  });
  
  res.json({ success: true, message: "Saved to In-Memory Hindsight" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`IncidentIQ Backend running on port ${PORT} (Using In-Memory DB)`);
});