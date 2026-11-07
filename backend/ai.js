const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeIncident(alertDetails, logs, hindsightContext) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  let contextString = "No relevant previous incidents found in Hindsight.";
  if (hindsightContext && hindsightContext.length > 0) {
    contextString = `Found past incidents in Hindsight:\n${hindsightContext.map(h => 
      `Issue: ${h.issueSignature}\nRoot Cause: ${h.rootCause}\nFix: ${h.resolution}`
    ).join('\n\n')}`;
  }

  const prompt = `
    You are IncidentIQ, an elite SRE AI assistant. 
    Analyze this incoming alert and logs.
    
    Alert: ${alertDetails.message}
    Severity: ${alertDetails.severity}
    
    Recent Logs:
    ${logs}
    
    Hindsight Context (Past Resolutions):
    ${contextString}
    
    Provide:
    1. A brief summary of the failure.
    2. The most likely root cause.
    3. Recommended steps for the engineer to investigate or fix it (prioritize using the Hindsight Context if it exists).
    
    Format the output cleanly with bullet points or numbered lists. Keep it highly technical.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { analyzeIncident };