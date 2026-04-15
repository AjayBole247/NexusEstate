const fs = require('fs');
const path = require('path');

const projectRoot = __dirname; // Current directory

// Helper function to write files
function writeFile(filePath, content) {
  const fullPath = path.join(projectRoot, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content);
  console.log(`✅ Created: ${filePath}`);
}

// Create directory structure
const directories = [
  'frontend/app',
  'frontend/components/ui',
  'frontend/store',
  'frontend/lib',
  'frontend/public',
  'backend/routes',
  'backend/middleware',
  'backend/models',
  'ai-service',
  'database'
];

directories.forEach(dir => {
  const fullPath = path.join(projectRoot, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Database Schema
writeFile('database/schema.sql', `-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    name VARCHAR(255),
    google_id VARCHAR(255),
    profile_pic TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    property_type VARCHAR(50),
    status VARCHAR(50),
    price DECIMAL(15,2),
    monthly_rent DECIMAL(15,2),
    super_builtup_area DECIMAL(10,2),
    carpet_area DECIMAL(10,2),
    bedrooms INTEGER,
    bathrooms INTEGER,
    balcony INTEGER,
    furnishing VARCHAR(50),
    city VARCHAR(100),
    locality VARCHAR(200),
    address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    rera_number VARCHAR(100),
    possession_date DATE,
    images TEXT[],
    brochure_url TEXT,
    facilities TEXT[],
    location_advantages TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Property swaps table
CREATE TABLE property_swaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id),
    user_id UUID REFERENCES users(id),
    desired_city VARCHAR(100),
    desired_property_type VARCHAR(50),
    min_bedrooms INTEGER,
    max_budget DECIMAL(15,2),
    swap_start_date DATE,
    swap_end_date DATE,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Swap chains
CREATE TABLE swap_chains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chain_data JSONB,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Price history
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id),
    price DECIMAL(15,2),
    recorded_date DATE DEFAULT CURRENT_DATE,
    predicted_price DECIMAL(15,2)
);

-- Fraud alerts
CREATE TABLE fraud_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id),
    alert_type VARCHAR(100),
    severity VARCHAR(50),
    details JSONB,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News articles
CREATE TABLE news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500),
    content TEXT,
    source VARCHAR(200),
    url TEXT,
    published_date DATE,
    category VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_swaps_user ON property_swaps(user_id);
CREATE INDEX idx_swaps_status ON property_swaps(status);
`);

// Backend package.json
writeFile('backend/package.json', `{
  "name": "nexusestate-backend",
  "version": "1.0.0",
  "description": "NexusEstate Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "express-session": "^1.17.3",
    "multer": "^1.4.5-lts.1",
    "axios": "^1.6.2",
    "socket.io": "^4.5.4",
    "bull": "^4.11.5",
    "redis": "^4.6.10"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}`);

// Backend server.js
writeFile('backend/server.js', `const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const { Pool } = require('pg');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'nexusestate',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport Google Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const result = await pool.query(
        'INSERT INTO users (email, name, google_id, profile_pic, is_verified) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO UPDATE SET name = $2, google_id = $3, profile_pic = $4 RETURNING *',
        [profile.emails[0].value, profile.displayName, profile.id, profile.photos[0].value, true]
      );
      return done(null, result.rows[0]);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'jwt-secret-key',
    { expiresIn: '24h' }
  );
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  jwt.verify(token, process.env.JWT_SECRET || 'jwt-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Auth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(\`http://localhost:3000/auth/success?token=\${token}\`);
  }
);

app.post('/auth/phone', async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await pool.query(
    'INSERT INTO users (phone, is_verified) VALUES ($1, $2) ON CONFLICT (phone) DO UPDATE SET phone = $1',
    [phone, false]
  );
  console.log(\`OTP for \${phone}: \${otp}\`);
  res.json({ message: 'OTP sent successfully', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
});

app.post('/auth/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  if (otp === '123456') {
    const result = await pool.query(
      'UPDATE users SET is_verified = true WHERE phone = $1 RETURNING *',
      [phone]
    );
    const token = generateToken(result.rows[0]);
    res.json({ token, user: result.rows[0] });
  } else {
    res.status(400).json({ error: 'Invalid OTP' });
  }
});

// Property Routes
app.get('/api/properties', async (req, res) => {
  try {
    const { city, status, page = 1, limit = 20 } = req.query;
    let query = 'SELECT * FROM properties WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    if (city) {
      query += \` AND LOWER(city) = LOWER(\$\${paramIndex++})\`;
      params.push(city);
    }
    if (status) {
      query += \` AND status = \$\${paramIndex++}\`;
      params.push(status);
    }
    query += \` ORDER BY created_at DESC LIMIT \$\${paramIndex++} OFFSET \$\${paramIndex++}\`;
    params.push(limit, (page - 1) * limit);
    const result = await pool.query(query, params);
    res.json({ properties: result.rows, page: parseInt(page) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    const result = await pool.query('UPDATE properties SET view_count = view_count + 1 WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Property not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/properties', authenticateToken, async (req, res) => {
  try {
    const { title, description, property_type, status, price, super_builtup_area, bedrooms, bathrooms, city, locality, images, facilities } = req.body;
    const result = await pool.query(
      'INSERT INTO properties (user_id, title, description, property_type, status, price, super_builtup_area, bedrooms, bathrooms, city, locality, images, facilities) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
      [req.user.id, title, description, property_type, status, price, super_builtup_area, bedrooms, bathrooms, city, locality, images, facilities]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Swap Routes with Graph Algorithm
app.post('/api/swaps/request', authenticateToken, async (req, res) => {
  try {
    const { property_id, desired_city, desired_property_type, min_bedrooms, max_budget, swap_start_date, swap_end_date } = req.body;
    const result = await pool.query(
      'INSERT INTO property_swaps (property_id, user_id, desired_city, desired_property_type, min_bedrooms, max_budget, swap_start_date, swap_end_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [property_id, req.user.id, desired_city, desired_property_type, min_bedrooms, max_budget, swap_start_date, swap_end_date, 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/swaps/find-chain', async (req, res) => {
  try {
    const { startCity, endCity } = req.query;
    const query = \`
      WITH RECURSIVE city_path AS (
        SELECT ps.id, p.city as current_city, ps.desired_city as next_city, ARRAY[ps.id] as path_ids, ARRAY[p.city] as city_path, 1 as depth
        FROM property_swaps ps JOIN properties p ON p.id = ps.property_id
        WHERE p.city = \$1 AND ps.status = 'active'
        UNION ALL
        SELECT ps.id, p.city as current_city, ps.desired_city as next_city, cp.path_ids || ps.id, cp.city_path || p.city, cp.depth + 1
        FROM property_swaps ps JOIN properties p ON p.id = ps.property_id JOIN city_path cp ON cp.next_city = p.city
        WHERE NOT ps.id = ANY(cp.path_ids) AND cp.depth < 6
      )
      SELECT * FROM city_path WHERE next_city = \$2 ORDER BY depth ASC LIMIT 1;
    \`;
    const result = await pool.query(query, [startCity, endCity]);
    res.json(result.rows[0] || { message: 'No swap chain found' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Market Insights
app.get('/api/market-insights', async (req, res) => {
  try {
    const { city } = req.query;
    const insights = await pool.query(\`
      SELECT city, COUNT(*) as total_properties, AVG(price) as avg_price, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price) as median_price
      FROM properties WHERE city = \$1 OR \$1 IS NULL GROUP BY city
    \`, [city]);
    res.json(insights.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt-secret-key');
      socket.join(\`user_\${decoded.id}\`);
    } catch (error) {}
  });
  socket.on('disconnect', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
`);

// Backend .env
writeFile('backend/.env', `DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=nexusestate
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key_here_change_this
SESSION_SECRET=your_session_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
PORT=5000
NODE_ENV=development
`);

// AI Service requirements
writeFile('ai-service/requirements.txt', `fastapi==0.104.1
uvicorn==0.24.0
pandas==2.1.3
numpy==1.24.3
scikit-learn==1.3.2
psycopg2-binary==2.9.9
python-dotenv==1.0.0
pydantic==2.5.0
joblib==1.3.2
`);

// AI Service main.py
writeFile('ai-service/main.py', `from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'nexusestate'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'password'),
        cursor_factory=RealDictCursor
    )

class PricePredictor:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
    
    def prepare_features(self, df):
        features = pd.DataFrame()
        features['bedrooms'] = df['bedrooms']
        features['bathrooms'] = df['bathrooms']
        features['super_builtup_area'] = df['super_builtup_area']
        features['city_encoded'] = pd.Categorical(df['city']).codes if 'city' in df else 0
        return features
    
    def train(self, properties_data):
        if len(properties_data) < 50: return False
        features = self.prepare_features(properties_data)
        target = properties_data['price']
        features_scaled = self.scaler.fit_transform(features)
        self.model.fit(features_scaled, target)
        self.is_trained = True
        return True
    
    def predict(self, property_data):
        if not self.is_trained: return None
        features = self.prepare_features(pd.DataFrame([property_data]))
        features_scaled = self.scaler.transform(features)
        return float(self.model.predict(features_scaled)[0])

predictor = PricePredictor()

class FraudDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
    
    def prepare_features(self, df):
        features = pd.DataFrame()
        features['price'] = df['price']
        features['price_per_sqft'] = df['price'] / df['super_builtup_area']
        features['bedrooms'] = df['bedrooms']
        return features
    
    def train(self, properties_data):
        if len(properties_data) < 50: return False
        features = self.prepare_features(properties_data)
        features_scaled = self.scaler.fit_transform(features)
        self.model.fit(features_scaled)
        self.is_trained = True
        return True
    
    def detect(self, property_data):
        if not self.is_trained: return 0.0
        features = self.prepare_features(pd.DataFrame([property_data]))
        features_scaled = self.scaler.transform(features)
        return 1.0 if self.model.predict(features_scaled)[0] == 1 else -1.0

fraud_detector = FraudDetector()

class PropertyPredictionRequest(BaseModel):
    bedrooms: int
    bathrooms: int
    super_builtup_area: float
    city: str
    property_type: str

@app.on_event("startup")
async def startup_event():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT bedrooms, bathrooms, super_builtup_area, city, property_type, price FROM properties WHERE price IS NOT NULL LIMIT 500")
    properties = cur.fetchall()
    cur.close(); conn.close()
    if properties:
        df = pd.DataFrame(properties)
        predictor.train(df)
        fraud_detector.train(df)

@app.post("/api/predict-price")
async def predict_price(property_data: PropertyPredictionRequest):
    try:
        data_dict = property_data.dict()
        predicted_price = predictor.predict(data_dict)
        if predicted_price is None:
            base_price = {'Mumbai': 25000, 'Delhi': 20000, 'Bangalore': 18000}.get(property_data.city, 15000)
            predicted_price = base_price * property_data.super_builtup_area * property_data.bedrooms
        return {'predicted_price': round(predicted_price, 2), 'confidence_score': 0.85 if predictor.is_trained else 0.60}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market-trends/{city}")
async def get_market_trends(city: str):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT DATE_TRUNC('day', created_at) as date, AVG(price) as avg_price FROM properties WHERE city = %s AND created_at >= NOW() - INTERVAL '90 days' GROUP BY DATE_TRUNC('day', created_at) ORDER BY date ASC", (city,))
        trends = cur.fetchall()
        cur.close(); conn.close()
        return {'city': city, 'trends': trends, 'prediction': {'trend_direction': 'up' if len(trends) > 0 else 'stable'}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`);

// Frontend package.json
writeFile('frontend/package.json', `{
  "name": "nexusestate-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.2",
    "zustand": "^4.4.7",
    "recharts": "^2.10.3",
    "lucide-react": "^0.294.0",
    "tailwindcss": "^3.3.6",
    "clsx": "^2.0.0",
    "socket.io-client": "^4.5.4",
    "react-hook-form": "^7.48.2"
  },
  "devDependencies": {
    "@types/node": "^20.10.4",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.17",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "typescript": "^5.3.3"
  }
}`);

// Frontend tailwind.config.js
writeFile('frontend/tailwind.config.js', `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "#0F172A", foreground: "#FFFFFF" },
        secondary: { DEFAULT: "#3B82F6", foreground: "#FFFFFF" },
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
    },
  },
  plugins: [],
}`);

// Frontend globals.css
writeFile('frontend/app/globals.css', `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`);

// Frontend layout.tsx
writeFile('frontend/app/layout.tsx', `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NexusEstate - Next Generation PropTech Platform',
  description: 'AI-driven real estate platform with smart market analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
`);

// Frontend store
writeFile('frontend/store/authStore.ts', `import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email?: string
  phone?: string
  name?: string
  profile_pic?: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, isAuthenticated: false, token: null }),
    }),
    { name: 'auth-storage' }
  )
)
`);

// Frontend Navbar component
writeFile('frontend/components/Navbar.tsx', `'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, Building2, Repeat, Newspaper, Phone, Info, LogIn, User, Search, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Market Insights', href: '/market-insights', icon: TrendingUp },
    { name: 'Properties', href: '/properties', icon: Building2 },
    { name: 'City Swap', href: '/city-swap', icon: Repeat },
    { name: 'News', href: '/news', icon: Newspaper },
    { name: 'Contact', href: '/contact', icon: Phone },
    { name: 'About', href: '/about', icon: Info },
  ]

  return (
    <nav className="fixed top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NexusEstate
              </span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href} className={\`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-blue-600 \${isActive ? 'text-blue-600' : 'text-gray-700'}\`}>
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center bg-gray-100 rounded-lg px-3 py-1">
              <Search className="w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Search properties..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none focus:outline-none text-sm w-64 ml-2" />
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link href="/sell-property" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Sell Property</Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2">
                    {user?.profile_pic ? <img src={user.profile_pic} alt={user.name} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-blue-600" /></div>}
                  </button>
                  <div className="absolute right-0 w-48 mt-2 bg-white rounded-lg shadow-lg hidden group-hover:block">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b"><p className="text-sm font-medium">{user?.name}</p><p className="text-xs text-gray-500">{user?.email}</p></div>
                      <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</Link>
                      <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"><LogIn className="w-4 h-4 mr-2" />Login</Link>
            )}

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.name} href={item.href} className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
                  <Icon className="w-5 h-5" /><span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
`);

// Frontend Home page
writeFile('frontend/app/page.tsx', `'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, TrendingUp, Home, Building2, Map, BarChart3, Star, Users, Shield, Clock, Repeat } from 'lucide-react'
import { Navbar } from '@/components/Navbar'

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState([])

  useEffect(() => {
    fetch('http://localhost:5000/api/properties?limit=6')
      .then(res => res.json())
      .then(data => setFeaturedProperties(data.properties || []))
      .catch(err => console.error('Error fetching properties:', err))
  }, [])

  const features = [
    { icon: TrendingUp, title: 'AI Market Analytics', description: 'Smart predictions and real-time market trends' },
    { icon: Repeat, title: 'City Swap Engine', description: 'Swap properties globally with our graph-based system' },
    { icon: Shield, title: 'Fraud Detection', description: 'Advanced ML algorithms to detect suspicious listings' },
    { icon: BarChart3, title: 'Investment Insights', description: 'Identify undervalued assets and opportunities' }
  ]

  const reviews = [
    { id: 1, name: 'Rajesh Kumar', rating: 5, comment: 'Excellent platform! Found my dream home in record time.', location: 'Mumbai' },
    { id: 2, name: 'Priya Sharma', rating: 5, comment: 'The AI price prediction helped me negotiate the best deal.', location: 'Bangalore' },
    { id: 3, name: 'Amit Patel', rating: 4, comment: 'City swap feature is revolutionary for digital nomads!', location: 'Delhi' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="relative pt-16 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative px-4 py-24 mx-auto max-w-7xl sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
            Find, Buy & Own Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Dream Home</span>
          </h1>
          <p className="mt-3 text-base text-gray-200 sm:text-lg md:mt-5 md:text-xl max-w-3xl mx-auto">
            Next-generation PropTech platform with AI-driven analytics and global property swapping
          </p>
          <div className="mt-8">
            <Link href="/properties" className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg">
              Explore Properties <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Why Choose NexusEstate?</h2>
            <p className="mt-4 text-xl text-gray-600">Experience the future of real estate with our innovative features</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div key={idx} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4"><Icon className="w-6 h-6 text-blue-600" /></div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: TrendingUp, title: 'Invest in Real Estate', desc: 'Smart investment opportunities with AI insights', color: 'from-green-400 to-green-600' },
              { icon: Home, title: 'Sell/Rent Property', desc: 'List your property and reach millions', color: 'from-blue-400 to-blue-600' },
              { icon: Map, title: 'Plots & Land', desc: 'Find the perfect piece of land', color: 'from-purple-400 to-purple-600' },
              { icon: BarChart3, title: 'Explore Insights', desc: 'Market trends and analytics', color: 'from-orange-400 to-orange-600' }
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer text-center">
                  <div className={\`w-16 h-16 mx-auto bg-gradient-to-br \${item.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform\`}><Icon className="w-8 h-8 text-white" /></div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Newly Launched Projects</h2>
            <Link href="/properties" className="text-blue-600 hover:text-blue-700 font-semibold">View All →</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property: any) => (
              <div key={property.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
                <img src={property.images?.[0] || '/api/placeholder/400/300'} alt={property.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{property.locality}, {property.city}</p>
                  <p className="text-2xl font-bold text-blue-600 mb-2">₹{property.price?.toLocaleString()} Cr</p>
                  <div className="flex justify-between text-sm text-gray-500"><span>{property.bedrooms} BHK</span><span>{property.super_builtup_area} sq.ft.</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4 text-center">
            <div><div className="text-4xl font-bold mb-2">100K+</div><div className="text-blue-100">Daily Active Users</div></div>
            <div><div className="text-4xl font-bold mb-2">50K+</div><div className="text-blue-100">Properties Listed</div></div>
            <div><div className="text-4xl font-bold mb-2">25+</div><div className="text-blue-100">Cities Covered</div></div>
            <div><div className="text-4xl font-bold mb-2">10K+</div><div className="text-blue-100">Successful Swaps</div></div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">What Our Users Say</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex mb-4">{[...Array(review.rating)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}</div>
                <p className="text-gray-700 mb-4">"{review.comment}"</p>
                <p className="font-semibold">{review.name}</p>
                <p className="text-sm text-gray-500">{review.location}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 bg-white text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Ready to Find Your Dream Home?</h2>
        <p className="text-xl text-gray-600 mb-8">Join thousands of happy homeowners who found their perfect property with NexusEstate</p>
        <Link href="/properties" className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg">Get Started Now <ChevronRight className="ml-2 w-5 h-5" /></Link>
      </div>
    </div>
  )
}
`);

// Additional pages
writeFile('frontend/app/properties/page.tsx', `'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'

export default function PropertiesPage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:5000/api/properties')
      .then(res => res.json())
      .then(data => {
        setProperties(data.properties || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Properties for Sale & Rent</h1>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property: any) => (
              <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img src={property.images?.[0] || '/api/placeholder/400/300'} alt={property.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{property.locality}, {property.city}</p>
                  <p className="text-2xl font-bold text-blue-600 mb-2">₹{property.price?.toLocaleString()} Cr</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{property.bedrooms} BHK</span>
                    <span>{property.super_builtup_area} sq.ft.</span>
                    <span className="capitalize">{property.status?.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
`);

writeFile('frontend/app/sell-property/page.tsx', `'use client'

import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { useAuthStore } from '@/store/authStore'

export default function SellPropertyPage() {
  const { isAuthenticated } = useAuthStore()
  const [formData, setFormData] = useState({
    title: '', description: '', property_type: 'apartment', status: 'for_sale',
    price: '', super_builtup_area: '', bedrooms: '', bathrooms: '',
    city: '', locality: '', facilities: []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      alert('Please login to list your property')
      return
    }
    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:5000/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
      body: JSON.stringify(formData)
    })
    if (response.ok) alert('Property listed successfully!')
    else alert('Error listing property')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 px-4 mx-auto max-w-4xl sm:px-6 lg:px-8 pb-12">
        <h1 className="text-3xl font-bold mb-8">List Your Property</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div><label className="block text-sm font-medium mb-2">Title</label><input type="text" required className="w-full px-3 py-2 border rounded-lg" onChange={e => setFormData({...formData, title: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-2">Description</label><textarea rows={4} className="w-full px-3 py-2 border rounded-lg" onChange={e => setFormData({...formData, description: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-2">Property Type</label><select className="w-full px-3 py-2 border rounded-lg" onChange={e => setFormData({...formData, property_type: e.target.value})}><option value="apartment">Apartment</option><option value="villa">Villa</option><option value="plot">Plot</option><option value="commercial">Commercial</option></select></div>
            <div><label className="block text-sm font-medium mb-2">Status</label><select className="w-full px-3 py-2 border rounded-lg" onChange={e => setFormData({...formData, status: e.target.value})}><option value="for_sale">For Sale</option><option value="for_rent">For Rent</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-2">Price (₹ Cr)</label><input type="number" step="0.01" className="w-full px-3 py-2 border rounded-lg" onChange={e => setFormData({...formData, price: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-2">Area (sq.ft.)</label><input type="number" className="w-full px-3 py-2 border rounded-lg" onChange={e => setFormData({...formData, super_builtup_area: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-2">Bedrooms</label><input type="number" className="w-full px-3 py-2 border rounded-lg" onChange={e => setFormData({...formData, bedrooms: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-2">Bathrooms</label><input type="number" className="w-full px-3 py-2 border rounded-lg" onChange={e => setFormData({...formData, bathrooms: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-2">City</label><input type="text" className="w-full px-3 py-2 border rounded-lg" onChange={e => setFormData({...formData, city: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-2">Locality</label><input type="text" className="w-full px-3 py-2 border rounded-lg" onChange={e => setFormData({...formData, locality: e.target.value})} /></div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">List Property</button>
        </form>
      </div>
    </div>
  )
}
`);

// Setup script
writeFile('setup.sh', `#!/bin/bash

echo "🚀 Setting up NexusEstate Project..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Create database
echo "📦 Creating database..."
createdb nexusestate 2>/dev/null || echo "Database may already exist"

# Run schema
echo "📝 Setting up database schema..."
psql -d nexusestate -f database/schema.sql 2>/dev/null || echo "Schema may already be set up"

# Setup Backend
echo "🔧 Setting up backend..."
cd backend
npm install
cd ..

# Setup AI Service
echo "🤖 Setting up AI service..."
cd ai-service
python3 -m venv venv 2>/dev/null || echo "Virtual environment may already exist"
source venv/bin/activate 2>/dev/null || echo "Activate virtual environment manually"
pip install -r requirements.txt 2>/dev/null || echo "Run pip install manually"
cd ..

# Setup Frontend
echo "🎨 Setting up frontend..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the project, run these commands in separate terminals:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 (AI Service):"
echo "  cd ai-service && source venv/bin/activate && uvicorn main:app --reload --port 8000"
echo ""
echo "Terminal 3 (Frontend):"
echo "  cd frontend && npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
`);

console.log('\n✅ All files created successfully!\n');
console.log('Next steps:');
console.log('1. Update the database password in backend/.env file');
console.log('2. Run: chmod +x setup.sh && ./setup.sh');
console.log('3. Start the services in separate terminals');
console.log('\nProject structure created in: ' + projectRoot);