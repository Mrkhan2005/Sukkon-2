import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { Booking, Therapist, ServicePackage, ClientReview, DashboardStats } from './src/types';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

// Ensure correct JSON parsing on request body
app.use(express.json());

// Initialize Database structures
let bookings: Booking[] = [];
let therapists: Therapist[] = [];
let services: ServicePackage[] = [];
let reviews: ClientReview[] = [];
let stats = {
  whatsappClicks: 248 // Initial seed counter
};

// Default Services Seed
const defaultServices: ServicePackage[] = [
  {
    id: 'pkg-1',
    name: 'Basic Relaxation',
    duration: 60,
    price: 3500,
    description: 'Designed to melt away daily stress, promote heavy sleep cycles, and increase overall blood circulation.',
    features: ['Professional Swedish Strokes', 'Therapeutic Ambient Music', 'Sanitized Premium Sheets', 'Premium Lavender Oils', 'Full Body Coverage'],
    glowColor: 'rgba(15, 118, 110, 0.15)'
  },
  {
    id: 'pkg-2',
    name: 'Premium Recovery',
    duration: 90,
    price: 5500,
    description: 'Deep trigger points releases to unclamp rigid muscles, target sports fatigue, and relieve persistent neck and shoulder stiffness.',
    features: ['Trigger Point & Deep Tissue', 'Hot Compress Warm-up', 'Custom Herbal Organic Balm', 'Focus Area Specialization', 'Muscle Stretch Assist'],
    glowColor: 'rgba(16, 185, 129, 0.15)'
  },
  {
    id: 'pkg-3',
    name: 'Elite Wellness',
    duration: 120,
    price: 7500,
    description: 'The ultimate luxury home wellness session combining medical-grade hygiene, muscle manipulation, and full neural relaxation.',
    features: ['Complete 120-Min Bespoke Therapy', 'Organic Aromatherapy Oils', 'Complimentary Herbal Tea', 'Premium Hot Stone Accents', 'Uncapped Custom Focus Areas', 'Complimentary Eye-Compress Treatment'],
    glowColor: 'rgba(245, 158, 11, 0.15)'
  }
];

// Default Therapists Seed
const defaultTherapists: Therapist[] = [
  {
    id: 'th-1',
    name: 'Ali Ahmed',
    gender: 'Male',
    experience: '8 Years',
    certifications: ['Certified Deep Tissue Therapist (PMTB)', 'Sports Recovery Specialist'],
    languages: ['Urdu', 'English'],
    specialization: ['Deep Tissue Massage', 'Sports Injury Recovery', 'Trigger Point Therapy'],
    status: 'Available',
    rating: 4.9,
    completedSessions: 840
  },
  {
    id: 'th-2',
    name: 'Sana Rizvi',
    gender: 'Female',
    experience: '6 Years',
    certifications: ['Diplomatic Swedish & Aromatherapy Practitioner', 'Seniors Wellness & Mobilization Cert'],
    languages: ['Urdu', 'Sindhi'],
    specialization: ['Aromatherapy Massage', 'Swedish Relaxation', 'Elderly Care Massage'],
    status: 'Available',
    rating: 4.8,
    completedSessions: 610
  },
  {
    id: 'th-3',
    name: 'Kamran Khan',
    gender: 'Male',
    experience: '10 Years',
    certifications: ['Master Chiropractics & Massage Therapy Diploma', 'Nerve Decompression Specialist'],
    languages: ['Urdu', 'Pashto'],
    specialization: ['Deep Tissue Massage', 'Office Worker Therapy', 'Seniors Mobility Care'],
    status: 'Available',
    rating: 4.9,
    completedSessions: 1250
  },
  {
    id: 'th-4',
    name: 'Zainab Fatima',
    gender: 'Female',
    experience: '7 Years',
    certifications: ['Certified Prenatal & Postnatal Therapist', 'Zen Massage Master Certification'],
    languages: ['Urdu', 'English', 'Punjabi'],
    specialization: ['Seniors Specialized Care', 'Bespoke Relaxation Therapy', 'Lymphatic Relief'],
    status: 'Available',
    rating: 5.0,
    completedSessions: 940
  }
];

// Default Reviews Seed
const defaultReviews: ClientReview[] = [
  {
    id: 'rev-1',
    author: 'Fahad Mehmood',
    rating: 5,
    text: 'Exceptional deep tissue massage. My lower back pain is completely gone. Kamran brought fresh sanitized towels and organic oils. Highly premium service in Karachi!',
    date: 'June 10, 2026',
    location: 'DHA Phase 6',
    approved: true
  },
  {
    id: 'rev-2',
    author: 'Ayesha Khan',
    rating: 5,
    text: 'Sana provided massage treatment for my elderly mother. She was extremely patient, soft-spoken, and respectful. It has helped with Mom\'s joint pain immensely.',
    date: 'June 12, 2026',
    location: 'Clifton Block 5',
    approved: true
  },
  {
    id: 'rev-3',
    author: 'Hammad Siddiqi',
    rating: 5,
    text: 'An architectural standard of tranquility. The whole process is seamless. Booking via website took seconds. Therapist was incredibly polished and expert. Unbelievable.',
    date: 'June 08, 2026',
    location: 'PECHS',
    approved: true
  }
];

// Helper functions for reading and writing data
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const dbContent = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(dbContent);
      bookings = data.bookings || [];
      therapists = data.therapists || defaultTherapists;
      services = data.services || defaultServices;
      reviews = data.reviews || defaultReviews;
      stats = data.stats || { whatsappClicks: 248 };
    } else {
      bookings = [];
      therapists = defaultTherapists;
      services = defaultServices;
      reviews = defaultReviews;
      saveDB();
    }
  } catch (error) {
    console.error('Error loading local DB', error);
    // fallback
    bookings = [];
    therapists = defaultTherapists;
    services = defaultServices;
    reviews = defaultReviews;
  }
}

function saveDB() {
  try {
    const data = { bookings, therapists, services, reviews, stats };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving local DB', error);
  }
}

// Initial DB load
loadDB();

// Dynamic stats calculator helper
function getDashboardStats(): DashboardStats {
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length;
  const completedBookings = bookings.filter(b => b.status === 'Completed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'Cancelled').length;
  
  // Confirmed & Completed constitute total actual revenue
  const totalRevenue = bookings
    .filter(b => b.status === 'Completed' || b.status === 'Confirmed')
    .reduce((sum, b) => sum + b.price, 0);

  // Projected counts everything except cancelled
  const projectedRevenue = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + b.price, 0);

  const activeTherapists = therapists.filter(t => t.status === 'Available' || t.status === 'On Duty').length;
  
  const approvedReviews = reviews.filter(r => r.approved);
  const averageRating = approvedReviews.length > 0
    ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
    : 4.9;

  return {
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    totalRevenue,
    projectedRevenue,
    activeTherapists,
    averageRating: parseFloat(averageRating.toFixed(1)),
    whatsappClicks: stats.whatsappClicks || 248
  };
}

// Lazy Gemini client getter to prevent crash on startup if key is missing
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required in secrets setup.');
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return geminiClient;
}


// --- API ROUTES ---

// Gemini Smart Wellness & Consult Advisor (Incorporates High Thinking)
app.post('/api/gemini/consult', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message payload is required.' });
    }

    const ai = getGeminiClient();

    // Construct deep context to inject services, therapists, area lists so Gemini responds in-character & intelligently
    const servicesText = services.map(s => `- ${s.name} (${s.duration} Min, PKR ${s.price}): ${s.description}`).join('\n');
    const therapistsText = therapists.map(t => `- ${t.name} (${t.gender}, Rating: ${t.rating}): Specialises in ${t.specialization.join(', ')}. Certs: ${t.certifications.join(', ')}`).join('\n');
    const areas = ['DHA', 'Clifton', 'Gulshan', 'Gulistan-e-Johar', 'North Nazimabad', 'PECHS', 'Bahadurabad', 'Saddar', 'Malir', 'Bahria Town Karachi'];

    const systemPrompt = `
You are the Deep Wellness Consultant AI for Sukoon.com, Karachi's luxury in-home massage and medical-grade therapy service. 
Your tone must be expert, prestigious, medical-grade, safe, calm, and friendly (representing luxury standards like Airbnb, Headspace, Apple, or high-end clinics).

Here is directory context about our business that you must match perfectly:

KARACHI AREAS ACCESSIBLE: ${areas.join(', ')}.

OUR ACTIVE THERAPISTS:
${therapistsText}

OUR PACKAGES:
${servicesText}

GUIDELINES FOR ANSWERS:
1. Provide safe, highly customized advice. If the user presents shoulder pain, explain Swedish vs Deep Tissue, highlight benefits for mobility (especially for elderly care), recommends specific durations and therapists (e.g. recommend Ali Ahmed or Sana Rizvi), and gives expert, supportive recommendations.
2. If asked about therapy safety (background checks, trained licensed therapist, family friendly standards, medical level hygiene), immediately reassure them of Sukoon's strict verification.
3. Suggest the most optimal Package for their requirements. Present prices in PKR accurately.
4. Encourage booking and generate tailored booking suggestions.
5. Emphasize that all sessions feature sterile organic cold-pressed oils, sanitized fresh premium microfibre sheets, and customizable relaxing soundscapes.

Format your output in professional Markdown with subtle headings, clean spacing, and bullet points.
`;

    // Process using gemini-3.1-pro-preview in HIGH thinking level as requested by thinking-mode feature standard
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...(history || []).map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH
        }
      }
    });

    const reply = response.text || "I am currently analyzing your wellness details. Please share your physical wellness objectives or discomfort area, and I will prescribe the perfect custom session.";
    res.json({ text: reply });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: 'The deep-thinking advisor is currently recharging or your GEMINI_API_KEY is not set.', 
      details: error.message 
    });
  }
});

// Settings & Setup state GET
app.get('/api/config', (req, res) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
    appName: 'Sukoon',
    tagline: 'Karachi\'s premier home wellness platform'
  });
});

// Bookings GET
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// Bookings POST
app.post('/api/bookings', (req, res) => {
  const { name, phone, whatsapp, location, serviceType, preferredDate, preferredTime, specialNotes } = req.body;
  if (!name || !phone || !whatsapp || !location || !serviceType || !preferredDate || !preferredTime) {
    return res.status(400).json({ error: 'All mandatory booking fields are required.' });
  }

  // Find price from package
  const selectedPackage = services.find(s => s.name.toLowerCase() === serviceType.toLowerCase()) || services[0];
  
  const newBooking: Booking = {
    id: `bk-${Date.now()}`,
    name,
    phone,
    whatsapp,
    location,
    serviceType: selectedPackage.name,
    preferredDate,
    preferredTime,
    specialNotes: specialNotes || '',
    status: 'Pending',
    packageName: selectedPackage.name,
    price: selectedPackage.price,
    createdAt: new Date().toISOString()
  };

  bookings.unshift(newBooking);
  saveDB();
  res.status(201).json(newBooking);
});

// Bookings PUT status edit
app.put('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  const booking = bookings.find(b => b.id === id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  booking.status = status;
  saveDB();
  res.json(booking);
});

// Statistics GET
app.get('/api/stats', (req, res) => {
  res.json(getDashboardStats());
});

// Statistics Increment whatsapp click count (conversion tracking)
app.post('/api/stats/whatsapp', (req, res) => {
  stats.whatsappClicks = (stats.whatsappClicks || 248) + 1;
  saveDB();
  res.json({ clicks: stats.whatsappClicks });
});

// Therapists GET
app.get('/api/therapists', (req, res) => {
  res.json(therapists);
});

// Therapists CRUD / Management
app.post('/api/therapists', (req, res) => {
  const { name, gender, experience, certifications, languages, specialization, status } = req.body;
  if (!name || !gender || !experience) {
    return res.status(400).json({ error: 'Name, gender, and experience are required for therapists.' });
  }

  const newTherapist: Therapist = {
    id: `th-${Date.now()}`,
    name,
    gender,
    experience,
    certifications: Array.isArray(certifications) ? certifications : [certifications].filter(Boolean),
    languages: Array.isArray(languages) ? languages : [languages].filter(Boolean),
    specialization: Array.isArray(specialization) ? specialization : [specialization].filter(Boolean),
    status: status || 'Available',
    rating: 5.0,
    completedSessions: 0
  };

  therapists.push(newTherapist);
  saveDB();
  res.status(201).json(newTherapist);
});

app.put('/api/therapists/:id', (req, res) => {
  const { id } = req.params;
  const index = therapists.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Therapist not found' });

  therapists[index] = { ...therapists[index], ...req.body };
  saveDB();
  res.json(therapists[index]);
});

app.delete('/api/therapists/:id', (req, res) => {
  const { id } = req.params;
  therapists = therapists.filter(t => t.id !== id);
  saveDB();
  res.json({ success: true });
});

// Services / Packages GET & CRUD
app.get('/api/services', (req, res) => {
  res.json(services);
});

app.put('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const index = services.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Service not found' });

  services[index] = { ...services[index], ...req.body };
  saveDB();
  res.json(services[index]);
});

// Reviews / Testimonials Setup
app.get('/api/reviews', (req, res) => {
  // Return all database reviews (both approved and pending) for admin management
  res.json(reviews);
});

app.get('/api/reviews/approved', (req, res) => {
  // Customers only see approved ones
  res.json(reviews.filter(r => r.approved));
});

app.post('/api/reviews', (req, res) => {
  const { author, rating, text, location } = req.body;
  if (!author || !rating || !text || !location) {
    return res.status(400).json({ error: 'Author, rating, text, and location are required.' });
  }

  const newReview: ClientReview = {
    id: `rev-${Date.now()}`,
    author,
    rating: parseInt(rating),
    text,
    location,
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
    approved: false // Starts pending moderation
  };

  reviews.unshift(newReview);
  saveDB();
  res.status(201).json(newReview);
});

app.put('/api/reviews/:id/approve', (req, res) => {
  const { id } = req.params;
  const review = reviews.find(r => r.id === id);
  if (!review) return res.status(404).json({ error: 'Review not found' });

  review.approved = !review.approved; // Toggle approval status
  saveDB();
  res.json(review);
});

app.delete('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  reviews = reviews.filter(r => r.id !== id);
  saveDB();
  res.json({ success: true });
});


// --- ASSET SERVING & ENGINE BOOTSTRAP ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Mount Vite in middleware mode for ultra-responsive Hot Reload during developments
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Standalone Static production hosting from built dist directories
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SUKOON API] Core Service listening successfully on port ${PORT}`);
    console.log(`[SUKOON API] Database file loaded successfully at ${DB_FILE}`);
  });
}

startServer();
