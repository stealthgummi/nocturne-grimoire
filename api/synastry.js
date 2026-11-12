const { resolveCityAsync } = require('../lib/geo.js');
const { calculateNatalChart } = require('../lib/ephemeris.js');
const { calculateTwinSynastry } = require('../lib/vespera_engine.js');

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
    const a = payload?.personA || { name: 'Lilith', date: '1995-10-31', time: '23:11', city: 'New Orleans' };
    const b = payload?.personB || { name: 'Julian', date: '1993-05-14', time: '18:30', city: 'London' };

    await Promise.all([resolveCityAsync(a.city || 'New Orleans'), resolveCityAsync(b.city || 'London')]);
    const chartA = calculateNatalChart(a);
    const chartB = calculateNatalChart(b);
    const synastry = calculateTwinSynastry(chartA, chartB, a.name || 'You', b.name || 'Beloved');

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 200;
    res.end(JSON.stringify({ success: true, ...synastry }));
  } catch (err) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
};

