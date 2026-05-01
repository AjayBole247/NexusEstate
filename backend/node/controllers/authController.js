const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'nexus-super-secret';

const UserModel = require('../models/userModel');

exports.googleLogin = async (req, res) => {
  try {
    const { token, role } = req.body;
    
    let email = 'user@example.com';
    let name = 'Nexus User';

    if (token === "mock-google-jwt-token") {
      email = 'demo.investor@nexus.com';
      name = 'Demo Account';
    } else {
      // Decode real Google JWT
      const decoded = jwt.decode(token);
      if (decoded && decoded.email) {
        email = decoded.email;
        name = decoded.name || 'Google User';
      }
    }

    // Map old roles or invalid roles to the new enum
    const validRoles = ['tenant', 'landlord', 'admin'];
    const finalRole = validRoles.includes(role) ? role : 'tenant';

    // Upsert into DB
    const dbUser = await UserModel.upsertUser(email, name, finalRole);
    
    // Create Nexus JWT
    const payload = { id: dbUser.id, email: dbUser.email, name: dbUser.full_name, role: dbUser.role };
    const jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token: jwtToken, user: payload });
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(500).json({ error: 'Internal Authentication Error' });
  }
};
