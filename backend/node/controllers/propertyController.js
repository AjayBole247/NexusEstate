const PropertyModel = require('../models/propertyModel');
require('dotenv').config();

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

exports.getAllProperties = async (req, res) => {
  try {
    const properties = await PropertyModel.getAllProperties();
    res.json(properties);
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.getPropertyInsights = async (req, res) => {
  const propertyId = req.params.id;

  try {
    const property = await PropertyModel.getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const features = {
      city: property.city,
      bedrooms: property.bhk,
      bathrooms: property.bathrooms,
      square_feet: property.sqft,
      has_swimming_pool: property.has_pool ? 1 : 0,
      has_gym: property.has_gym ? 1 : 0,
      has_clubhouse: 0,
      has_sports_ground: 0,
      dist_metro_km: property.dist_metro_km,
      dist_bus_km: 2.0, // mock
      dist_highway_km: property.dist_highway_km,
      year_built: 2015 // mock
    };

    // Parallel fetch to Python AI
    const [predictRes, fraudRes, desirabilityRes, similarRes] = await Promise.all([
      fetch(`${PYTHON_SERVICE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features })
      }).catch(() => null),
      fetch(`${PYTHON_SERVICE_URL}/analyze-fraud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listed_price: property.price, location: property.city })
      }).catch(() => null),
      fetch(`${PYTHON_SERVICE_URL}/desirability-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features })
      }).catch(() => null),
      fetch(`${PYTHON_SERVICE_URL}/similar-properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: property.city, price: property.price, bhk: property.bhk })
      }).catch(() => null)
    ]);

    let predicted_price = property.price;
    let desirability_score = 50;
    let fraud_flag = false;
    let similar_properties = [];

    if (predictRes && predictRes.ok) {
      const data = await predictRes.json();
      predicted_price = data.predicted_value;
    }
    if (fraudRes && fraudRes.ok) {
      const data = await fraudRes.json();
      fraud_flag = data.is_anomaly;
    }
    if (desirabilityRes && desirabilityRes.ok) {
      const data = await desirabilityRes.json();
      desirability_score = data.desirability_score;
    }
    if (similarRes && similarRes.ok) {
      const data = await similarRes.json();
      similar_properties = data.similar_properties;
    }

    res.json({
      property: {
        id: property.id,
        title: property.title,
        asking_price: property.price,
        specs: { sqft: property.sqft, bhk: property.bhk, bathrooms: property.bathrooms }
      },
      ai_insights: {
        status: predictRes && predictRes.ok ? 'success' : 'error',
        predicted_price,
        desirability_score,
        fraud_flag,
        similar_properties
      }
    });

  } catch (err) {
    console.error('Error fetching insights:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
