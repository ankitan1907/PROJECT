import mongoose from 'mongoose';

// User Model
const userSchema = new mongoose.Schema({
  googleId: { type: String, sparse: true, unique: true }, // Not required for email signup
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String }, // For email/password signup
  picture: { type: String },
  age: { type: Number },
  gender: { type: String, enum: ['female', 'male', 'other', 'prefer-not-to-say'] },
  emergencyContacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relation: { type: String, required: true },
    isPrimary: { type: Boolean, default: false }
  }],
  preferredLanguage: { type: String, enum: ['en', 'hi', 'kn', 'ta', 'te'], default: 'en' },
  profileSetupComplete: { type: Boolean, default: false },
  isGuest: { type: Boolean, default: false },
  authProvider: { type: String, enum: ['google', 'email', 'guest'], default: 'email' },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Incident Report Model
const incidentReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['harassment', 'stalking', 'catcalling', 'inappropriate_touching', 'suspicious_activity', 'other'],
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'extreme'],
    required: true 
  },
  description: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  address: { type: String, required: true },
  city: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  photos: [{ type: String }], // URLs to uploaded photos
  isVerified: { type: Boolean, default: false },
  reportedBy: { type: String, default: 'anonymous' },
  status: { 
    type: String, 
    enum: ['pending', 'verified', 'resolved', 'false_report'],
    default: 'pending'
  }
});

// Create geospatial index for location-based queries
incidentReportSchema.index({ location: '2dsphere' });

// Safe Zone Model
const safeZoneSchema = new mongoose.Schema({
  label: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['safe_zone', 'risk_zone'],
    required: true 
  },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  address: { type: String, required: true },
  city: { type: String, required: true },
  radius: { type: Number, default: 200 }, // meters
  riskLevel: { 
    type: String, 
    enum: ['low', 'moderate', 'high', 'extreme'],
    required: true 
  },
  incidentCount: { type: Number, default: 0 },
  lastIncident: { type: Date },
  verifiedBy: { type: String, default: 'community' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

// Create geospatial index for location-based queries
safeZoneSchema.index({ location: '2dsphere' });

// Safe Business Model (for women-verified safe places)
const safeBusinessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['cafe', 'restaurant', 'shop', 'auto_stand', 'pharmacy', 'hospital', 'police_station'],
    required: true 
  },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  address: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String },
  hours: { type: String },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  verifiedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    date: { type: Date, default: Date.now }
  }],
  isWomenFriendly: { type: Boolean, default: true },
  amenities: [{ type: String }], // ['cctv', 'well_lit', 'female_staff', 'security']
  createdAt: { type: Date, default: Date.now }
});

safeBusinessSchema.index({ location: '2dsphere' });

// SOS Alert Model
const sosAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  address: { type: String, required: true },
  emergencyContacts: [{
    name: { type: String },
    phone: { type: String },
    messageSent: { type: Boolean, default: false },
    messageId: { type: String }
  }],
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'resolved', 'false_alarm'],
    default: 'active'
  },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

sosAlertSchema.index({ location: '2dsphere' });

// Export models
export const User = mongoose.model('User', userSchema);
export const IncidentReport = mongoose.model('IncidentReport', incidentReportSchema);
export const SafeZone = mongoose.model('SafeZone', safeZoneSchema);
export const SafeBusiness = mongoose.model('SafeBusiness', safeBusinessSchema);
export const SOSAlert = mongoose.model('SOSAlert', sosAlertSchema);

// Database connection
export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');

    // Seed demo data if collections are empty
    await seedDemoData();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Demo data seeding function
const seedDemoData = async () => {
  try {
    // Check if data already exists
    const [safeZoneCount, incidentCount, businessCount] = await Promise.all([
      SafeZone.countDocuments(),
      IncidentReport.countDocuments(),
      SafeBusiness.countDocuments()
    ]);

    if (safeZoneCount === 0) {
      console.log('🌱 Seeding Safe Zones...');
      await SafeZone.insertMany([
        // Safe Zones
        {
          label: 'MG Road Safe Zone',
          description: 'Well-lit commercial area with police patrolling',
          type: 'safe_zone',
          location: { type: 'Point', coordinates: [77.6031, 12.9760] }, // Bangalore
          address: 'MG Road, Bangalore, Karnataka 560001',
          city: 'Bangalore',
          radius: 300,
          riskLevel: 'low',
          verifiedBy: 'Bangalore Police'
        },
        {
          label: 'Connaught Place Safe Zone',
          description: 'Central Delhi shopping area with good security',
          type: 'safe_zone',
          location: { type: 'Point', coordinates: [77.2167, 28.6304] }, // Delhi
          address: 'Connaught Place, New Delhi, Delhi 110001',
          city: 'Delhi',
          radius: 400,
          riskLevel: 'low',
          verifiedBy: 'Delhi Police'
        },
        {
          label: 'Marine Drive Safe Zone',
          description: 'Mumbai seafront with constant foot traffic',
          type: 'safe_zone',
          location: { type: 'Point', coordinates: [72.8347, 18.9432] }, // Mumbai
          address: 'Marine Drive, Mumbai, Maharashtra 400020',
          city: 'Mumbai',
          radius: 500,
          riskLevel: 'low',
          verifiedBy: 'Mumbai Police'
        },
        {
          label: 'Anna Salai Safe Zone',
          description: 'Chennai main road with regular police presence',
          type: 'safe_zone',
          location: { type: 'Point', coordinates: [80.2480, 13.0527] }, // Chennai
          address: 'Anna Salai, Chennai, Tamil Nadu 600002',
          city: 'Chennai',
          radius: 250,
          riskLevel: 'low',
          verifiedBy: 'Chennai Police'
        },
        {
          label: 'Park Street Safe Zone',
          description: 'Kolkata entertainment district with good lighting',
          type: 'safe_zone',
          location: { type: 'Point', coordinates: [88.3506, 22.5448] }, // Kolkata
          address: 'Park Street, Kolkata, West Bengal 700016',
          city: 'Kolkata',
          radius: 300,
          riskLevel: 'low',
          verifiedBy: 'Kolkata Police'
        },
        
        // Risk Zones
        {
          label: 'Isolated Construction Area',
          description: 'Poorly lit construction site with multiple incidents',
          type: 'risk_zone',
          location: { type: 'Point', coordinates: [77.5946, 12.9716] }, // Bangalore outskirts
          address: 'Electronics City Phase 2, Bangalore, Karnataka 560100',
          city: 'Bangalore',
          radius: 200,
          riskLevel: 'high',
          incidentCount: 15,
          lastIncident: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          label: 'Dark Underpass Area',
          description: 'Poorly maintained underpass with safety concerns',
          type: 'risk_zone',
          location: { type: 'Point', coordinates: [77.2090, 28.5355] }, // Delhi
          address: 'Nehru Place Underpass, New Delhi, Delhi 110019',
          city: 'Delhi',
          radius: 150,
          riskLevel: 'moderate',
          incidentCount: 8,
          lastIncident: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          label: 'Vacant Lot Near Station',
          description: 'Unmonitored area near railway station',
          type: 'risk_zone',
          location: { type: 'Point', coordinates: [72.8777, 19.0760] }, // Mumbai
          address: 'Near Dadar Station, Mumbai, Maharashtra 400028',
          city: 'Mumbai',
          radius: 180,
          riskLevel: 'moderate',
          incidentCount: 12,
          lastIncident: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
      ]);
    }

    if (incidentCount === 0) {
      console.log('🌱 Seeding Incident Reports...');
      await IncidentReport.insertMany([
        {
          userId: new mongoose.Types.ObjectId(),
          userName: 'Priya S.',
          type: 'harassment',
          severity: 'medium',
          description: 'Man following me for 3 blocks, making inappropriate comments',
          location: { type: 'Point', coordinates: [77.6040, 12.9720] },
          address: 'Brigade Road, Bangalore, Karnataka',
          city: 'Bangalore',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          reportedBy: 'Priya S.'
        },
        {
          userId: new mongoose.Types.ObjectId(),
          userName: 'Anita R.',
          type: 'catcalling',
          severity: 'low',
          description: 'Group of men making loud comments near bus stop',
          location: { type: 'Point', coordinates: [77.2100, 28.6280] },
          address: 'Rajiv Chowk, New Delhi, Delhi',
          city: 'Delhi',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          reportedBy: 'Anita R.'
        },
        {
          userId: new mongoose.Types.ObjectId(),
          userName: 'Meera K.',
          type: 'stalking',
          severity: 'high',
          description: 'Same person has been following me to work for 3 days',
          location: { type: 'Point', coordinates: [72.8350, 18.9420] },
          address: 'Nariman Point, Mumbai, Maharashtra',
          city: 'Mumbai',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          reportedBy: 'Meera K.',
          isVerified: true
        },
        {
          userId: new mongoose.Types.ObjectId(),
          userName: 'Kavya T.',
          type: 'inappropriate_touching',
          severity: 'extreme',
          description: 'Inappropriate touching in crowded metro during rush hour',
          location: { type: 'Point', coordinates: [80.2500, 13.0520] },
          address: 'Chennai Central Metro, Chennai, Tamil Nadu',
          city: 'Chennai',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          reportedBy: 'Kavya T.'
        },
        {
          userId: new mongoose.Types.ObjectId(),
          userName: 'Sita M.',
          type: 'suspicious_activity',
          severity: 'medium',
          description: 'Men loitering near college gate, approaching female students',
          location: { type: 'Point', coordinates: [88.3500, 22.5420] },
          address: 'College Street, Kolkata, West Bengal',
          city: 'Kolkata',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          reportedBy: 'Sita M.'
        },
        {
          userId: new mongoose.Types.ObjectId(),
          userName: 'Riya P.',
          type: 'harassment',
          severity: 'high',
          description: 'Auto driver took wrong route and made inappropriate suggestions',
          location: { type: 'Point', coordinates: [77.5950, 12.9750] },
          address: 'Koramangala, Bangalore, Karnataka',
          city: 'Bangalore',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          reportedBy: 'Riya P.'
        },
        {
          userId: new mongoose.Types.ObjectId(),
          userName: 'Pooja L.',
          type: 'catcalling',
          severity: 'low',
          description: 'Bike riders making whistling sounds and comments',
          location: { type: 'Point', coordinates: [77.2080, 28.6350] },
          address: 'Karol Bagh, New Delhi, Delhi',
          city: 'Delhi',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          reportedBy: 'Pooja L.'
        },
        {
          userId: new mongoose.Types.ObjectId(),
          userName: 'Lakshmi N.',
          type: 'harassment',
          severity: 'medium',
          description: 'Shopkeeper making inappropriate comments while alone in store',
          location: { type: 'Point', coordinates: [72.8380, 18.9380] },
          address: 'Linking Road, Bandra, Mumbai, Maharashtra',
          city: 'Mumbai',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          reportedBy: 'Lakshmi N.'
        },
        {
          userId: new mongoose.Types.ObjectId(),
          userName: 'Divya S.',
          type: 'suspicious_activity',
          severity: 'medium',
          description: 'Men taking photos without permission in public transport',
          location: { type: 'Point', coordinates: [80.2700, 13.0800] },
          address: 'T. Nagar, Chennai, Tamil Nadu',
          city: 'Chennai',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          reportedBy: 'Divya S.'
        },
        {
          userId: new mongoose.Types.ObjectId(),
          userName: 'Asha G.',
          type: 'stalking',
          severity: 'high',
          description: 'Unknown person following me from metro station to home',
          location: { type: 'Point', coordinates: [88.3600, 22.5300] },
          address: 'Esplanade, Kolkata, West Bengal',
          city: 'Kolkata',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          reportedBy: 'Asha G.'
        }
      ]);
    }

    if (businessCount === 0) {
      console.log('🌱 Seeding Safe Businesses...');
      await SafeBusiness.insertMany([
        {
          name: 'Cafe Coffee Day - MG Road',
          category: 'cafe',
          location: { type: 'Point', coordinates: [77.6041, 12.9761] },
          address: 'MG Road, Bangalore, Karnataka 560001',
          city: 'Bangalore',
          phone: '+91-80-12345678',
          hours: '7:00 AM - 11:00 PM',
          rating: 4.5,
          amenities: ['cctv', 'well_lit', 'female_staff'],
          verifiedBy: [new mongoose.Types.ObjectId()]
        },
        {
          name: 'Apollo Pharmacy - Connaught Place',
          category: 'pharmacy',
          location: { type: 'Point', coordinates: [77.2168, 28.6305] },
          address: 'Connaught Place, New Delhi, Delhi 110001',
          city: 'Delhi',
          phone: '+91-11-87654321',
          hours: '8:00 AM - 10:00 PM',
          rating: 4.8,
          amenities: ['cctv', 'security', 'well_lit'],
          verifiedBy: [new mongoose.Types.ObjectId()]
        },
        {
          name: 'Women-Only Auto Stand',
          category: 'auto_stand',
          location: { type: 'Point', coordinates: [72.8348, 18.9433] },
          address: 'Near Churchgate Station, Mumbai, Maharashtra',
          city: 'Mumbai',
          phone: '+91-22-11223344',
          hours: '6:00 AM - 11:00 PM',
          rating: 4.7,
          amenities: ['female_drivers', 'security', 'well_lit'],
          verifiedBy: [new mongoose.Types.ObjectId()]
        }
      ]);
    }

    console.log('✅ Demo data seeded successfully');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
  }
};
