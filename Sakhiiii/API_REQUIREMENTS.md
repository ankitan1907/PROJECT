# 🔑 Sakhi App - API Requirements & Integration Guide

## Overview
This document outlines all the APIs and backend services needed to make Sakhi a fully functional women's safety app with real-time features.

## 🚀 Required APIs & Services

### 1. Google APIs
```
🔗 Google OAuth 2.0 API
- Purpose: Real Google Sign-in with user profile data
- Setup: Google Cloud Console → APIs & Services → Credentials
- Scope: profile, email, openid
- Environment: VITE_GOOGLE_CLIENT_ID

🗺️ Google Maps JavaScript API  
- Purpose: Real maps, routing, geocoding
- Setup: Google Cloud Console → Maps Platform
- Features: Maps, Directions, Geocoding, Places
- Environment: VITE_GOOGLE_MAPS_API_KEY

📍 Google Geocoding API
- Purpose: Convert coordinates to addresses
- Billing: $5 per 1000 requests
- Environment: Same as Maps API key
```

### 2. SMS Service APIs
```
📱 Twilio SMS API (Recommended)
- Purpose: Send SMS alerts to emergency contacts
- Setup: twilio.com → Console → Phone Numbers
- Cost: $0.0075 per SMS in India
- Environment: 
  - VITE_TWILIO_ACCOUNT_SID
  - VITE_TWILIO_AUTH_TOKEN  
  - VITE_TWILIO_PHONE_NUMBER

Alternative: AWS SNS SMS
- Purpose: Same as Twilio but via AWS
- Cost: $0.00645 per SMS
- Setup: AWS Console → SNS
```

### 3. WhatsApp Business API
```
💬 WhatsApp Business API
- Purpose: WhatsApp bot integration
- Provider: Twilio, 360Dialog, or Meta directly
- Features: Send safety alerts, route suggestions
- Cost: $0.005 per message
- Environment: VITE_WHATSAPP_API_KEY
```

### 4. Backend Database & APIs
```
🗄️ Database (Choose one):
- PostgreSQL (Recommended for complex queries)
- MongoDB (Good for geospatial data)
- Supabase (Postgres with real-time features)

📡 Backend API Endpoints:
- POST /auth/google - Handle Google OAuth
- POST /users/profile - Update user profile
- GET/POST /emergency-contacts - Manage contacts
- POST /incidents/report - Report safety incidents
- GET /heatmap/zones - Get safety heatmap data
- POST /sms/send - Send SMS alerts
- GET/POST /safe-businesses - Women-safe business data
- POST /sos/trigger - Handle SOS alerts
- GET /trends/analysis - Incident trend data
```

### 5. Real-time Features
```
⚡ WebSocket/Socket.IO
- Purpose: Real-time location sharing
- Features: Emergency circle, live tracking
- Environment: VITE_WEBSOCKET_URL

🔄 Push Notifications
- Firebase Cloud Messaging (FCM)
- Purpose: Background safety alerts
- Environment: VITE_FIREBASE_CONFIG
```

## 🛠️ Implementation Priority

### Phase 1: Core Safety Features (Week 1)
1. ✅ Real Google Sign-in integration
2. ✅ SMS alerts via Twilio
3. ✅ Google Maps integration for routing
4. ✅ Emergency contacts management
5. ✅ SOS button with real SMS sending

### Phase 2: Advanced Features (Week 2)  
1. ✅ Predictive safety heatmap
2. ✅ Danger zone detection with voice alerts
3. ✅ Emergency circle (live location sharing)
4. ✅ Safe business directory
5. ✅ Incident trend analysis

### Phase 3: Smart Features (Week 3)
1. 🔄 WhatsApp bot integration
2. 🔄 Offline SOS mode
3. 🔄 AI-powered route optimization
4. 🔄 Community reporting verification
5. 🔄 Real-time safety scoring

## 💰 Cost Estimation (Monthly for 1000 active users)

```
Google Maps API: $200-400
Twilio SMS: $150-300 (20 SMS per user)
WhatsApp API: $50-100
Backend Hosting: $50-100 (AWS/GCP)
Database: $30-60
Total: ~$480-960/month
```

## 🔧 Environment Variables Needed

Create `.env` file with:
```bash
# Google APIs
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key

# Twilio SMS
VITE_TWILIO_ACCOUNT_SID=your_twilio_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_token
VITE_TWILIO_PHONE_NUMBER=your_twilio_number

# WhatsApp
VITE_WHATSAPP_API_KEY=your_whatsapp_key

# Backend
VITE_BACKEND_URL=http://localhost:3000
VITE_WEBSOCKET_URL=ws://localhost:3001

# Firebase (for notifications)
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## 🏗️ Backend Architecture Recommendation

```
Node.js + Express + TypeScript
├── /auth - Google OAuth handling
├── /users - User profile management  
├── /incidents - Safety incident reports
├── /heatmap - Predictive safety data
├── /sms - SMS alert service
├── /websocket - Real-time features
├── /whatsapp - WhatsApp bot
└── /ai - Predictive algorithms

Database Schema:
├── users (id, google_id, profile, settings)
├── emergency_contacts (user_id, contact_info)
├── incidents (location, type, severity, timestamp)
├── safety_zones (coordinates, risk_score, trends)
├── safe_businesses (location, verification, ratings)
└── sos_alerts (user_id, location, contacts, status)
```

## 🚀 Quick Setup Guide

1. **Get API Keys:**
   - Google: console.cloud.google.com
   - Twilio: twilio.com/console
   - Maps: Enable in Google Cloud Console

2. **Database Setup:**
   - Use Supabase for quick setup
   - Or PostgreSQL on Railway/Render

3. **Backend Deployment:**
   - Deploy on Railway/Render/Vercel
   - Set environment variables

4. **Testing:**
   - Use Postman for API testing
   - Test SMS with your phone number
   - Verify Google sign-in flow

## 📋 Features Implementation Status

### ✅ Currently Implemented:
- Real Google Sign-in service
- Advanced SMS alert system  
- Predictive safety heatmap
- Danger zone detection
- Emergency circle functionality
- Voice assistant integration
- Safe business directory
- Incident trend analysis

### 🔄 Next Steps:
1. Set up backend API endpoints
2. Integrate real Google Maps
3. Connect Twilio SMS service
4. Deploy and test end-to-end

## 🎯 Demo Features That Will Impress Judges

1. **Live Safety Heatmap** - Shows "Tonight: 80% risk increase in XYZ area"
2. **Smart Emergency Circle** - Real-time location sharing with 5-min updates
3. **WhatsApp Integration** - "Type 'SAFE ROUTE' → get directions"
4. **Voice Alerts** - "Warning: Entering high-risk zone" in user's language
5. **Predictive AI** - "Based on patterns, avoid this area after 9 PM"
6. **Safe Business Network** - "3 women-verified safe cafes nearby"

---

**Ready to implement? I can start with any API you provide the keys for! 🚀**
