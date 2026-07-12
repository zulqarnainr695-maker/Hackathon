const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Parses user complaints and matches keywords to return a structured fallback response.
 * Ensure the system does not crash if Gemini is unavailable.
 */
const getLocalTriageFallback = (complaint, assetInfo) => {
  console.log('[AI Triage Fallback] Running rule-based diagnostic parser.');
  const text = (complaint + ' ' + (assetInfo?.name || '') + ' ' + (assetInfo?.category || '')).toLowerCase();

  if (text.includes('vibration') || text.includes('vibrate') || text.includes('frequency') || text.includes('hvac')) {
    return {
      title: 'Compressor Vibration & Frequency Deviation Anomaly',
      priority: 'High',
      category: 'HVAC',
      possibleCauses: [
        'Loosened compressor mounting bolts',
        'Drive shaft misalignment',
        'Motor bearing degradation or lack of lubrication'
      ],
      initialChecks: [
        'Check tension and seating of mounting bolts',
        'Measure shaft alignment with laser/dial indicator',
        'Inspect belt condition and pulleys for wear'
      ],
      warning: 'Excessive vibration can cause permanent mechanical damage. Inspect promptly.'
    };
  }

  if (text.includes('leak') || text.includes('fluid') || text.includes('pressure') || text.includes('seal')) {
    return {
      title: 'Hydraulic Stamping Press Pressure Loss & Fluid Leak',
      priority: 'Emergency',
      category: 'Hydraulic',
      possibleCauses: [
        'Piston head cylinder seal failure',
        'Fluid line connector rupture or wear',
        'Inadequate oil level leading to aeration'
      ],
      initialChecks: [
        'Inspect major hydraulic seals for visible fluid loss',
        'Check system pressure readouts on analog and digital gauges',
        'Measure fluid level in the central oil reservoir'
      ],
      warning: 'High-pressure hydraulic fluid is extremely dangerous. De-pressurize before physical inspection.'
    };
  }

  if (text.includes('coolant') || text.includes('temperature') || text.includes('hot') || text.includes('overheat')) {
    return {
      title: 'Engine/Compressor Thermal Overload & Coolant Decline',
      priority: 'High',
      category: 'Mechanical',
      possibleCauses: [
        'Radiator micro-leak or split hose fitting',
        'Coolant pump failure or impeller damage',
        'Thermostat stuck in closed state'
      ],
      initialChecks: [
        'Verify coolant level in reservoir (allow system to cool first)',
        'Check hoses for swelling or signs of cracking',
        'Test thermostat opening temperature'
      ],
      warning: 'Do not open radiator cap while system is hot. Risk of severe burns.'
    };
  }

  if (text.includes('power') || text.includes('electrical') || text.includes('wire') || text.includes('fuse')) {
    return {
      title: 'Electrical Subsystem Failure / Power Disruption',
      priority: 'Emergency',
      category: 'Electrical',
      possibleCauses: [
        'Blown main line fuse or tripped circuit breaker',
        'Damaged or frayed power cable shielding',
        'Loose terminal connections in the junction box'
      ],
      initialChecks: [
        'Perform lock-out tag-out (LOTO) protocols',
        'Use voltmeter to verify phase voltage supply',
        'Check status indicators on circuit breakers'
      ],
      warning: 'DANGER: High voltage hazard. Ensure power source is locked and tagged out.'
    };
  }

  return {
    title: 'Unspecified Mechanical/System Anomaly',
    priority: 'Medium',
    category: 'Mechanical',
    possibleCauses: [
      'Sub-component alignment variance',
      'Normal physical fatigue/wear and tear',
      'Misaligned feedback sensor giving false positives'
    ],
    initialChecks: [
      'Perform complete external visual inspection',
      'Check system log error register history',
      'Query control panel status logs'
    ],
    warning: 'Wear appropriate personal protective equipment (PPE) before checking internal parts.'
  };
};

/**
 * Uses OpenAI Chat Completion API to triage issue complaints.
 * Falls back to local rule-based diagnostics if API fails or credentials are placeholders.
 * 
 * @param {object} assetInfo - Details of the asset.
 * @param {string} complaint - User text complaint.
 * @param {array} recentHistory - Recent maintenance timeline.
 * @returns {Promise<object>} Triage report details.
 */
const analyzeComplaint = async (assetInfo, complaint, recentHistory) => {
  const isMock = !process.env.GEMINI_API_KEY || 
                 process.env.GEMINI_API_KEY === 'gemini_test_key_placeholder' ||
                 process.env.GEMINI_API_KEY === 'your_gemini_api_key_here';

  if (isMock) {
    return getLocalTriageFallback(complaint, assetInfo);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Using gemini-1.5-flash which is standard and has structured JSON output support
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const systemPrompt = `You are a Senior Machinery Reliability Specialist. You help maintenance staff diagnose issues.
Your goal is to parse asset specifications, user complaints, and history, and return a JSON triage report.
The output MUST be a valid JSON object matching the following structure:
{
  "title": "Short descriptive title of the issue",
  "priority": "Low" | "Medium" | "High" | "Emergency",
  "category": "Mechanical" | "Electrical" | "HVAC" | "IT" | "Utility" | "Hydraulic" | "Other",
  "possibleCauses": ["Cause 1", "Cause 2", "Cause 3"],
  "initialChecks": ["Check 1", "Check 2", "Check 3"],
  "warning": "Optional safety warnings to technicians"
}`;

    const userPrompt = `
Asset Details:
Name: ${assetInfo?.name}
Category: ${assetInfo?.category}
Location: ${assetInfo?.location}
Condition: ${assetInfo?.condition}
Specifications: ${JSON.stringify(assetInfo?.specifications || {})}

User Complaint:
"${complaint}"

Recent Asset Maintenance Logs:
${JSON.stringify(recentHistory || [])}
`;

    const promptText = `${systemPrompt}\n\n${userPrompt}`;

    const result = await model.generateContent(promptText);
    const resultText = result.response.text();
    const triageData = JSON.parse(resultText);

    // Validate priorities
    if (!['Low', 'Medium', 'High', 'Emergency'].includes(triageData.priority)) {
      triageData.priority = 'Medium';
    }

    return triageData;
  } catch (error) {
    console.error('[Gemini Service Error] Chat completion failed:', error.message);
    return getLocalTriageFallback(complaint, assetInfo);
  }
};

module.exports = {
  analyzeComplaint
};
