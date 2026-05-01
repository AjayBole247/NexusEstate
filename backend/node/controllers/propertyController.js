const PropertyModel = require('../models/propertyModel');
require('dotenv').config();

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

exports.createProperty = async (req, res) => {
  const { owner_id, listed_price, location, metadata } = req.body;
  
  let true_valuation = null;
  let fraud_flag = false;

  try {
    const valuationRes = await fetch(`${PYTHON_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: { ...metadata, city: location } })
    });
    
    if (valuationRes.ok) {
      const data = await valuationRes.json();
      true_valuation = data.predicted_value;
    }

    const fraudRes = await fetch(`${PYTHON_SERVICE_URL}/analyze-fraud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listed_price, location })
    });

    if (fraudRes.ok) {
      const data = await fraudRes.json();
      fraud_flag = data.is_anomaly;
    }

  } catch (err) {
    console.error('Warning: Python microservice unavailable or failed.', err.message);
  }

  if (fraud_flag) {
    return res.status(400).json({ error: 'Listing flagged for suspicious pricing.' });
  }

  try {
    const property = await PropertyModel.insertProperty(owner_id, listed_price, location, true_valuation);
    res.status(201).json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.getUserProperties = async (req, res) => {
  try {
    const properties = await PropertyModel.getPropertiesByUser(req.params.userId);
    res.json(properties);
  } catch (err) {
    console.error('Error fetching user properties:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.getDesirabilityScore = async (req, res) => {
  const { location, metadata } = req.body;
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/desirability-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: { ...metadata, city: location } })
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json(data);
    } else {
      res.status(response.status).json({ error: 'Failed to calculate desirability' });
    }
  } catch (err) {
    console.error('Error fetching desirability score:', err);
    res.status(500).json({ error: 'Python microservice error' });
  }
};
