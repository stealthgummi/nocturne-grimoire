const { resolveCityAsync } = require('../lib/geo.js');
const { calculateNatalChart } = require('../lib/ephemeris.js');
const { castHoraryPendulumOracle } = require('../lib/vespera_engine.js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  try {
    let payload = req.body;
    if (typeof payload === 'string') payload = JSON.parse(payload || '{}');
    if (!payload || Object.keys(payload).length === 0) {
      const u = new URL(req.url, 'http://localhost');
      payload = {
        date: u.searchParams.get('date') || '1995-10-31',
        time: u.searchParams.get('time') || '23:11',
        city: u.searchParams.get('city') || 'New Orleans',
        question: u.searchParams.get('question') || 'Should I trust this portal?'
      };
    }
    await resolveCityAsync(payload.city || 'New Orleans');
    const chart = calculateNatalChart(payload);
    const result = castHoraryPendulumOracle(chart, payload.question, payload.city || 'New Orleans');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 200;
    res.end(JSON.stringify({ success: true, ...result }));
  } catch (err) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
};

