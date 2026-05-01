require('dotenv').config();

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

exports.proxyPredict = async (req, res) => {
  try {
    const valuationRes = await fetch(`${PYTHON_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    if (!valuationRes.ok) throw new Error('Python microservice returned an error');
    const data = await valuationRes.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching prediction:', err.message);
    res.status(503).json({ error: 'Analytics service unavailable' });
  }
};

exports.proxyFraud = async (req, res) => {
  try {
    const fraudRes = await fetch(`${PYTHON_SERVICE_URL}/analyze-fraud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    if (!fraudRes.ok) throw new Error('Python microservice returned an error');
    const data = await fraudRes.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching fraud analysis:', err.message);
    res.status(503).json({ error: 'Analytics service unavailable' });
  }
};
