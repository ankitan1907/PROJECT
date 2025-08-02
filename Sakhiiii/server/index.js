import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, User, IncidentReport, SafeZone, SafeBusiness, SOSAlert } from './models/index.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sakhi API is running', timestamp: new Date().toISOString() });
});

// Authentication endpoints
app.post('/api/auth/google', async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    // Check if user exists
    let user = await User.findOne({ googleId });

    if (!user) {
      // Create new user
      user = new User({
        googleId,
        email,
        name,
        picture,
        profileSetupComplete: false
      });
      await user.save();
    } else {
      // Update last active
      user.lastActive = new Date();
      await user.save();
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.picture,
        profileSetupComplete: user.profileSetupComplete
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
});

// User profile endpoints
app.post('/api/users/profile', async (req, res) => {
  try {
    const { userId, age, emergencyContacts, preferredLanguage } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        age,
        emergencyContacts,
        preferredLanguage,
        profileSetupComplete: true,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, error: 'Profile update failed' });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user' });
  }
});

// Safe zones and risk zones endpoints
app.get('/api/zones', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query; // radius in meters

    let query = {};
    
    // If location provided, find zones near that location
    if (lat && lng) {
      query = {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseInt(radius)
          }
        }
      };
    }

    const zones = await SafeZone.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      zones: zones.map(zone => ({
        id: zone._id,
        label: zone.label,
        description: zone.description,
        type: zone.type,
        coordinates: zone.location.coordinates,
        address: zone.address,
        city: zone.city,
        radius: zone.radius,
        riskLevel: zone.riskLevel,
        incidentCount: zone.incidentCount,
        lastIncident: zone.lastIncident
      }))
    });
  } catch (error) {
    console.error('Get zones error:', error);
    res.status(500).json({ success: false, error: 'Failed to get zones' });
  }
});

// Incident reporting endpoints
app.post('/api/incidents', async (req, res) => {
  try {
    const { userId, userName, type, severity, description, location, address, city, photos } = req.body;

    const incident = new IncidentReport({
      userId,
      userName,
      type,
      severity,
      description,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat] // MongoDB expects [lng, lat]
      },
      address,
      city,
      photos: photos || []
    });

    await incident.save();

    res.json({
      success: true,
      incident: {
        id: incident._id,
        type: incident.type,
        severity: incident.severity,
        description: incident.description,
        address: incident.address,
        city: incident.city,
        timestamp: incident.timestamp,
        reportedBy: incident.reportedBy
      }
    });
  } catch (error) {
    console.error('Report incident error:', error);
    res.status(500).json({ success: false, error: 'Failed to report incident' });
  }
});

app.get('/api/incidents', async (req, res) => {
  try {
    const { lat, lng, radius = 10000, limit = 50 } = req.query;

    let query = {};
    
    if (lat && lng) {
      query = {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseInt(radius)
          }
        }
      };
    }

    const incidents = await IncidentReport.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      incidents: incidents.map(incident => ({
        id: incident._id,
        type: incident.type,
        severity: incident.severity,
        description: incident.description,
        address: incident.address,
        city: incident.city,
        coordinates: incident.location.coordinates,
        timestamp: incident.timestamp,
        reportedBy: incident.reportedBy,
        isVerified: incident.isVerified
      }))
    });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ success: false, error: 'Failed to get incidents' });
  }
});

// Safe businesses endpoints
app.get('/api/safe-businesses', async (req, res) => {
  try {
    const { lat, lng, radius = 2000, category } = req.query;

    let query = {};
    
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    if (category) {
      query.category = category;
    }

    const businesses = await SafeBusiness.find(query).sort({ rating: -1 });

    res.json({
      success: true,
      businesses: businesses.map(business => ({
        id: business._id,
        name: business.name,
        category: business.category,
        coordinates: business.location.coordinates,
        address: business.address,
        city: business.city,
        phone: business.phone,
        hours: business.hours,
        rating: business.rating,
        amenities: business.amenities
      }))
    });
  } catch (error) {
    console.error('Get safe businesses error:', error);
    res.status(500).json({ success: false, error: 'Failed to get safe businesses' });
  }
});

// SOS Alert endpoints
app.post('/api/sos/trigger', async (req, res) => {
  try {
    const { userId, userName, location, address, emergencyContacts, message } = req.body;

    const sosAlert = new SOSAlert({
      userId,
      userName,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      },
      address,
      emergencyContacts,
      message
    });

    await sosAlert.save();

    res.json({
      success: true,
      alert: {
        id: sosAlert._id,
        status: sosAlert.status,
        createdAt: sosAlert.createdAt
      }
    });
  } catch (error) {
    console.error('SOS trigger error:', error);
    res.status(500).json({ success: false, error: 'Failed to trigger SOS' });
  }
});

// SMS sending endpoint (for Twilio integration)
app.post('/api/sms/send', async (req, res) => {
  try {
    const { message, contacts, location } = req.body;

    // Check if Twilio is configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.log('📱 Twilio not configured, simulating SMS send...');
      
      // Simulate successful SMS sending for demo
      const results = contacts.map(contact => ({
        contact: contact.name,
        phone: contact.phone,
        status: 'demo_sent',
        messageId: 'demo_' + Date.now()
      }));

      return res.json({
        success: true,
        results,
        totalSent: results.length,
        totalFailed: 0,
        mode: 'demo'
      });
    }

    // Import Twilio only when credentials are available
    const { default: twilio } = await import('twilio');
    const client = twilio(accountSid, authToken);
    const results = [];

    // Send SMS to each contact
    for (const contact of contacts) {
      try {
        const result = await client.messages.create({
          body: message,
          from: fromNumber,
          to: contact.phone
        });

        results.push({
          contact: contact.name,
          phone: contact.phone,
          status: 'sent',
          messageId: result.sid
        });

        console.log(`✅ SMS sent to ${contact.name} (${contact.phone})`);
      } catch (smsError) {
        console.error(`❌ Failed to send SMS to ${contact.phone}:`, smsError);
        results.push({
          contact: contact.name,
          phone: contact.phone,
          status: 'failed',
          error: smsError.message
        });
      }
    }

    res.json({
      success: true,
      results,
      totalSent: results.filter(r => r.status === 'sent').length,
      totalFailed: results.filter(r => r.status === 'failed').length,
      mode: 'production'
    });

  } catch (error) {
    console.error('SMS send error:', error);
    res.status(500).json({ success: false, error: 'Failed to send SMS' });
  }
});

// Geocoding endpoint (using Google Geocoding API)
app.post('/api/geocode/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Google Maps API key not configured' 
      });
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const address = data.results[0].formatted_address;
      const cityComponent = data.results[0].address_components.find(
        component => component.types.includes('locality')
      );
      const city = cityComponent ? cityComponent.long_name : 'Unknown';

      res.json({
        success: true,
        address,
        city
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'No address found for coordinates' 
      });
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({ success: false, error: 'Geocoding failed' });
  }
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [
      totalIncidents,
      recentIncidents,
      safeZones,
      riskZones,
      totalUsers
    ] = await Promise.all([
      IncidentReport.countDocuments(),
      IncidentReport.countDocuments({
        timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      SafeZone.countDocuments({ type: 'safe_zone' }),
      SafeZone.countDocuments({ type: 'risk_zone' }),
      User.countDocuments()
    ]);

    res.json({
      success: true,
      stats: {
        totalIncidents,
        recentIncidents,
        safeZones,
        riskZones,
        totalUsers,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get dashboard stats' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sakhi API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️ MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
  console.log(`📱 Twilio SMS: ${process.env.TWILIO_ACCOUNT_SID ? 'Configured' : 'Demo mode'}`);
  console.log(`🗺️ Google Maps: ${process.env.VITE_GOOGLE_MAPS_API_KEY ? 'Configured' : 'Not configured'}`);
});

export default app;
