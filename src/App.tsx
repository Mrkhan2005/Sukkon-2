import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Phone, MessageCircle, MapPin, Star, ShieldCheck, 
  Clock, Check, Heart, BrainCircuit, Users, Award,
  ChevronDown, Send, BookOpen, Map, Mail, Calendar, 
  Laptop, HardHat, FileText, Sun, Moon, HelpCircle, AlertCircle
} from 'lucide-react';
import { Therapist, ServicePackage, ClientReview, DashboardStats } from './types';
import BookingModal from './components/BookingModal';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // Theme & Page states
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAdminCenter, setShowAdminCenter] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedPkgForBooking, setSelectedPkgForBooking] = useState<ServicePackage | null>(null);

  // Loaded DB parameters
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  // Testimonial submission form
  const [reviewForm, setReviewForm] = useState({
    author: '',
    location: '',
    rating: 5,
    text: ''
  });
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

  // FAQ Accordion tracker
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Load all server side parameters
  const fetchClientData = async () => {
    try {
      const [sRes, tRes, rRes, statsRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/therapists'),
        fetch('/api/reviews/approved'),
        fetch('/api/stats')
      ]);

      setServices(await sRes.json());
      setTherapists(await tRes.json());
      setReviews(await rRes.json());
      setStats(await statsRes.json());
    } catch (e) {
      console.warn("Client API retrieval warning. Using robust local placeholders as backup.", e);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [isBookingOpen]); // refresh when user closes modal

  // Sync dark theme selector
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleOpenBooking = (pkg?: ServicePackage) => {
    setSelectedPkgForBooking(pkg || null);
    setIsBookingOpen(true);
  };

  const handleWhatsAppDirect = (pkgName?: string) => {
    // Analytics tracking
    fetch('/api/stats/whatsapp', { method: 'POST' });

    let messageText = `Assalamu Alaikum Sukoon Team, I am visiting Sukoon.com and would like to inquire about booking professional care at home. Please provide therapist availabilities inside Karachi areas.`;
    if (pkgName) {
      messageText = `Assalamu Alaikum Sukoon Team, I would like to book the: *${pkgName}* at home in Karachi. Please confirm availability of therapist slots!`;
    }
    const encoded = encodeURIComponent(messageText);
    window.open(`https://wa.me/923000678999?text=${encoded}`, '_blank');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.author || !reviewForm.text || !reviewForm.location) {
      alert("Please fill all review spaces.");
      return;
    }
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      });
      if (res.ok) {
        setReviewSubmitSuccess(true);
        setReviewForm({ author: '', location: '', rating: 5, text: '' });
      } else {
        alert("Unable to post review.");
      }
    } catch (e) {
      alert("Database unreachable.");
    }
  };

  const trustBadges = [
    { title: 'Verified Therapists', desc: '100% background and bio-metric checked', bg: 'bg-red-50/30 dark:bg-slate-900 border-red-100/30' },
    { title: 'Professional Training', desc: 'Medical-grade mobility & relaxation training', bg: 'bg-blue-50/30 dark:bg-slate-900 border-blue-100/30' },
    { title: 'Family-Friendly', desc: 'Strict protocols, gender matching, and total privacy', bg: 'bg-blue-50/30 dark:bg-slate-900 border-blue-100/30' },
    { title: 'Hygiene Standard', desc: 'Single-use sanitized linen, natural cold-pressed oils', bg: 'bg-red-50/30 dark:bg-slate-900 border-red-100/30' }
  ];

  const serviceCategories = [
    { name: 'Elderly Care Massage', duration: '90 Mins', price: 'PKR 5,500', icon: '👵', desc: 'Customized low-pressure manipulation to reduce muscle stiffness, alleviate chronic joint pain, and boost senior mobility.' },
    { name: 'Relaxation Massage', duration: '60 Mins', price: 'PKR 3,500', icon: '🌸', desc: 'Traditional Swedish strokes aiming to dismantle anxiety, support natural serotonin, and prepare the mind for deep deep sleep.' },
    { name: 'Deep Tissue Massage', duration: '90 Mins', price: 'PKR 5,500', icon: '💪', desc: 'Heavy trigger-point release concentrating on severe muscular tension, athletic soreness, and tissue rehabilitation.' },
    { name: 'Office Worker Therapy', duration: '60 Mins', price: 'PKR 3,500', icon: '💻', desc: 'Ergonomic neck, shoulder, and spinal release targeted at desk fatigue, spinal slouching, and posture stiffness.' },
    { name: 'Sports Recovery Massage', duration: '90 Mins', price: 'PKR 5,500', icon: '🏃‍♂️', desc: 'Post-training cooling strokes designed to deplete lactic acid accumulation and repair micro-muscle tears.' },
    { name: 'Home Wellness Session', duration: '120 Mins', price: 'PKR 7,500', icon: '✨', desc: 'Crowning medical-grade ritual bringing hot stones, sensory aromatherapy, warm compresses, and complete body restoration.' }
  ];

  const KARACHI_MAP_AREAS = [
    { name: 'DHA', coords: { top: '65%', left: '42%' }, desc: 'Phases 1-8 Coverage (Response rate within 30m)' },
    { name: 'Clifton', coords: { top: '58%', left: '33%' }, desc: 'Blocks 1-9 (Full resident matching)' },
    { name: 'PECHS', coords: { top: '44%', left: '50%' }, desc: 'Bahadurabad & Tariq Road vicinity' },
    { name: 'Gulshan', coords: { top: '33%', left: '55%' }, desc: 'Gulshan-e-Iqbal & university grid' },
    { name: 'Gulistan-e-Johar', coords: { top: '36%', left: '68%' }, desc: 'Blocks 1-20 (Durable therapist dispatch)' },
    { name: 'North Nazimabad', coords: { top: '22%', left: '40%' }, desc: 'Blocks A-N comprehensive home visits' },
    { name: 'Saddar', coords: { top: '52%', left: '44%' }, desc: 'Commercial residential hybrid slots' },
    { name: 'Malir', coords: { top: '40%', left: '82%' }, desc: 'Cantt & Township dispatch available' },
    { name: 'Bahria Town Karachi', coords: { top: '15%', left: '88%' }, desc: 'Scheduled pre-bookings only' }
  ];

  const faqItems = [
    {
      q: "How do you ensure safety and background validation in Karachi?",
      a: "Safety is our paramount standard. Every single therapist on Sukoon.com undergoes comprehensive biometric background authentication, criminal verification, and past medical track audits. We retain dual certified IDs of all therapists on our local servers."
    },
    {
      q: "Do you offer gender matching? Is it family-friendly?",
      a: "Yes, absolutely. We strictly assign professional female therapists to female clients, and professional male therapists to male clients. Sukoon is a professional, certified home healthcare and relaxation platform designed for family households."
    },
    {
      q: "What do I need to prepare at home before the therapist arrives?",
      a: "You do not need to prepare anything! Our therapists travel equipped with a premium, portable, sanitized clinical massage table, organic cold-pressed lavender oils, fresh single-use sanitized towels, and soft therapeutic music speakers. All you need to prepare is an empty 8x5 space in any room of your choosing."
    },
    {
      q: "What are your active working hours and areas?",
      a: "We operate 24/7. We dispatch therapists to DHA, Clifton, PECHS, Gulshan-e-Iqbal, Gulistan-e-Johar, North Nazimabad, Saddar, Bahadurabad, Malir, and Bahria Town Karachi. You can book for immediate dispatch or pre-schedule a future date."
    },
    {
      q: "How and when do I complete the pricing payment?",
      a: "There are absolutely no upfront fees or credit cards required on booking. Once your session is successfully completed, you can pay locally in cash or complete an online bank transfer directly to the clinician."
    }
  ];

  const blogPosts = [
    {
      title: 'Geriatric Wellness: Why Back Massage Restores Senior Mobility',
      desc: 'Exploring muscle stiffness in people over 65, and how professional home massage promotes healthy joint fluid production and combats insomnia.',
      tag: 'Elderly Care',
      readTime: '4 min read'
    },
    {
      title: 'The Silent Epidemic of Slouching: Unclogging Spinal Strain',
      desc: 'How 10-hour desk shifts clamp down cervical vertebrae, and trigger therapy techniques that immediately release trapezoid knots.',
      tag: 'Office Desk Health',
      readTime: '5 min read'
    },
    {
      title: 'Unclamping Stress: The Neurotransmitters Behind Swedish Strides',
      desc: 'Scientific insights on how Swedish therapeutic kneading reduces cortisol production by 31% while encouraging deep delta-wave sleep cycles.',
      tag: 'Anxiety Alleviation',
      readTime: '6 min read'
    }
  ];

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 font-sans transition-all duration-300 dark:bg-[#0B1120] dark:text-slate-100 relative overflow-x-hidden ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Premium Full-Page Floating Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            x: [0, 80, -45, 30, 0],
            y: [0, -110, 60, -50, 0],
            scale: [1, 1.2, 0.85, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/12 left-[5%] w-[450px] h-[450px] rounded-full bg-red-500/5 dark:bg-red-500/8 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -70, 90, -30, 0],
            y: [0, 130, -70, 40, 0],
            scale: [1, 0.85, 1.2, 0.95, 1],
          }}
          transition={{
            duration: 32,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[40%] right-[5%] w-[500px] h-[500px] rounded-full bg-blue-500/5 dark:bg-blue-500/8 blur-[140px]"
        />
        <motion.div
          animate={{
            x: [0, 50, -80, 60, 0],
            y: [0, 90, -90, -40, 0],
            scale: [1, 1.25, 0.8, 1.15, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[75%] left-[20%] w-[380px] h-[380px] rounded-full bg-rose-500/5 dark:bg-rose-500/5 blur-[110px]"
        />
        <motion.div
          animate={{
            x: [0, -90, 60, -40, 0],
            y: [0, -60, 100, -50, 0],
            scale: [1, 1.15, 0.85, 1.1, 1],
          }}
          transition={{
            duration: 36,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[5%] left-[10%] w-[420px] h-[420px] rounded-full bg-indigo-500/5 dark:bg-indigo-600/5 blur-[130px]"
        />
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full glass-nav flex items-center h-20 px-4 md:px-8 transition-all">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-7">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2">
              <span className="p-2 bg-brand-teal text-white rounded-xl font-display font-bold text-xl tracking-wider shadow-md shadow-red-500/10">
                S
              </span>
              <span className="font-display font-bold text-2xl tracking-normal text-slate-900 dark:text-white">
                Sukoon<span className="text-brand-emerald">.com</span>
              </span>
            </a>

            {/* Nav Menu */}
            <nav className="hidden lg:flex items-center gap-6.5 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
              <a href="#about" className="hover:text-brand-teal transition-all">Why Karachi Chooses Us</a>
              <a href="#services" className="hover:text-brand-teal transition-all">Services Offered</a>
              <a href="#packages" className="hover:text-brand-teal transition-all">Pricing Packages</a>
              <a href="#therapists" className="hover:text-brand-teal transition-all">Experts</a>
              <a href="#map" className="hover:text-brand-teal transition-all">Service Zones</a>
              <a href="#faqs" className="hover:text-brand-teal transition-all">FAQ</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark Mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-teal transition-all cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5 text-brand-gold" /> : <Moon className="w-4.5 h-4.5 text-slate-600" />}
            </button>

            {/* Secondary Command Center toggle */}
            <button
              onClick={() => setShowAdminCenter(!showAdminCenter)}
              className={`p-2.5 rounded-xl border transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                showAdminCenter 
                  ? 'bg-amber-100 hover:bg-amber-150 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-850 dark:text-amber-300' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-505 dark:text-slate-400 hover:text-brand-teal'
              }`}
            >
              <Laptop className="w-4 h-4" /> Admin HQ
            </button>

            {/* Main Book Button */}
            <button
              onClick={() => handleOpenBooking()}
              className="hidden md:flex py-2.5 px-5 bg-brand-teal hover:opacity-95 text-white rounded-xl shadow-lg shadow-red-500/10 font-semibold text-xs tracking-wide transition-all active:scale-95 cursor-pointer"
            >
              Book Home Care
            </button>

            <button
              onClick={() => handleWhatsAppDirect()}
              className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <MessageCircle className="w-4.5 h-4.5 fill-white" /> WhatsApp
            </button>
          </div>
        </div>
      </header>

      {/* Main Body content */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-24">
        
        {/* Conditional Master Admin Panel Overlay */}
        <AnimatePresence>
          {showAdminCenter && (
            <motion.section
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-1 border border-amber-200 dark:border-amber-900/50 rounded-3xl bg-amber-50/10 dark:bg-amber-950/5 relative overflow-hidden"
            >
              {/* Decorative admin warning border */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600"></div>
              <div className="p-4 md:p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-amber-200/50 pb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <span className="text-xs uppercase font-mono font-bold tracking-wider text-amber-600 dark:text-amber-400">Sukoon Operation Suite Active</span>
                  </div>
                  <button
                    onClick={() => setShowAdminCenter(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                     Hide Suite [✖]
                  </button>
                </div>
                <AdminPanel />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* SECTION 1: Luxury Hero Presentation */}
        <section id="hero" className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8 md:pt-16">
          
          {/* Back Glowing Auroras */}
          <div className="absolute -top-12 -left-20 w-80 h-80 bg-brand-teal/5 rounded-full filter blur-3xl dark:bg-brand-teal/10"></div>
          <div className="absolute bottom-10 -right-20 w-96 h-96 bg-brand-emerald/5 rounded-full filter blur-3xl dark:bg-brand-emerald/10"></div>

          {/* Left Hero Text Block */}
          <div className="lg:col-span-7 space-y-8 relative z-10 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal/5 dark:bg-red-500/10 border border-brand-teal/10 text-brand-teal dark:text-brand-emerald text-xs font-semibold tracking-wide"
            >
              <Sparkles className="w-4 h-4 animate-pulse-glow" /> Healthcare Standard In-Home Wellness
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-slate-900 dark:text-white leading-[1.1] tracking-tight"
              >
                Professional Home Massage <br />
                <span className="gradient-text">Services in Karachi</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-md sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"
              >
                Relax. Recover. Rejuvenate. Background-checked, medically certified therapists delivered directly to your doorstep with clinical-grade hygiene equipment.
              </motion.p>
            </div>

            {/* CTA Elements */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-2">
              <button
                onClick={() => handleOpenBooking()}
                className="w-full sm:w-auto py-4 px-8 bg-gradient-to-r from-brand-teal to-brand-emerald hover:opacity-95 text-white font-semibold text-sm rounded-2xl shadow-xl hover:shadow-red-700/20 transition-all active:scale-95 cursor-pointer"
              >
                Book Session Now
              </button>
              
              <button
                onClick={() => handleWhatsAppDirect()}
                className="w-full sm:w-auto py-4 px-8 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-brand-emerald text-slate-700 dark:text-slate-300 font-bold text-sm rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-emerald-500 text-emerald-500" /> Chat on WhatsApp
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 dark:border-slate-900">
              <div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">10,000+</p>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">Sessions Logged</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#F59E0B] font-display">4.9 ★</p>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">Customer Rating</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">50+</p>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">Verified Experts</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-brand-emerald font-display">~5 Min</p>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">Dispatch Response</p>
              </div>
            </div>
          </div>

          {/* Right Hero Image / Floating Illustration container */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Soft geometric luxury frame representing a massage table or peaceful aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-teal/10 to-brand-emerald/10 rounded-[3rem] filter blur-xl transform rotate-3"></div>
            
            <div className="relative w-full max-w-sm aspect-[4/5] bg-gradient-to-b from-red-500/5 to-white dark:from-slate-900 dark:to-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-850 shadow-2xl p-6 overflow-hidden flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="p-3 bg-brand-teal/10 text-brand-teal rounded-2xl block">
                    <Award className="w-6 h-6 animate-float-slow" />
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-emerald-500">Clinical Hygiene</span>
                </div>
                
                <h4 className="font-display font-semibold text-2xl text-slate-800 dark:text-white group-hover:translate-x-1 transition-transform">Sukoon Home Table</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  We bring our own specialized, lightweight, portable massage table that is sterilized before and after every single home visit. Premium towels and cold-pressed aromatherapy oils included in every single booking.
                </p>
              </div>

              {/* Mini Interactive map indicator */}
              <div className="p-4 bg-red-500/5 dark:bg-blue-500/5 border border-brand-teal/10 rounded-2xl flex items-center gap-3">
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-300 font-bold text-slate-800 text-[10px] flex items-center justify-center">M</div>
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 font-bold text-slate-800 text-[10px] flex items-center justify-center">F</div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Clinician Matched Instantly</p>
                  <p className="text-[10px] text-slate-400">Strict safety gender matching applied</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Trust Features section */}
        <section id="about" className="space-y-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto space-y-4"
          >
            <h2 className="font-display font-semibold text-3xl md:text-4xl text-slate-900 dark:text-white">
              Why Karachi Chooses Sukoon
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
              The professional alternative to unverified therapists. Bringing five-star international spa expectations to local residential neighborhoods.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`p-6 rounded-2xl border ${badge.bg} transition-all duration-300 hover:shadow-lg space-y-3.5`}
              >
                <div className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold">
                  {i === 0 && <ShieldCheck className="w-5.5 h-5.5" />}
                  {i === 1 && <Award className="w-5.5 h-5.5" />}
                  {i === 2 && <Users className="w-5.5 h-5.5" />}
                  {i === 3 && <Heart className="w-5.5 h-5.5" />}
                </div>
                <h3 className="font-semibold text-base text-slate-800 dark:text-white">{badge.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{badge.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>



        {/* SECTION 3: Beautiful Services section */}
        <section id="services" className="space-y-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto space-y-4"
          >
            <h2 className="font-display font-semibold text-3xl md:text-4xl text-slate-900 dark:text-white">
              Treatment & Rehabilitation Services
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed">
              Every appointment features custom sanitized materials, premium plant-extracted essential oils, and personalized tissue metrics.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCategories.map((srv, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 hover:border-brand-teal/30 dark:hover:border-brand-emerald/30 group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-3xl">{srv.icon}</span>
                    <span className="text-[10px] font-bold font-mono px-3 py-1 rounded-full bg-slate-150/40 dark:bg-slate-800 text-slate-500 dark:text-slate-450 uppercase tracking-wider">{srv.duration}</span>
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-white ">{srv.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed h-[64px] overflow-hidden">{srv.desc}</p>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-50 dark:border-slate-800/80 mt-6 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider block font-mono">Rates Starting</span>
                    <span className="text-md font-bold text-brand-teal dark:text-brand-emerald">{srv.price}</span>
                  </div>
                  
                  <button
                    onClick={() => handleOpenBooking()}
                    className="py-1 px-4 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-lg group-hover:bg-brand-teal dark:group-hover:bg-brand-emerald group-hover:text-white group-hover:border-transparent transition-all cursor-pointer"
                  >
                    Select Care
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 4: Package details (Comparison & pricing layout) */}
        <section id="packages" className="space-y-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto space-y-4"
          >
            <h2 className="font-display font-semibold text-3xl md:text-4xl text-slate-900 dark:text-white">
              Bespoke Pricing Packages
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-450">
              No hidden fees, no travel charges. Honest, transparent residential wellness.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {(services.length > 0 ? services : defaultServicesFallback).map((pkg, i) => {
              const isPopular = pkg.name.toLowerCase().includes('recovery');
              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative p-8 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col justify-between min-h-[480px] ${
                    isPopular 
                      ? 'bg-gradient-to-b from-slate-900 via-[#0B1120] to-slate-900 text-white border-2 border-brand-emerald dark:border-brand-emerald' 
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-850'
                  }`}
                >
                  {/* Glowing background bubble */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full filter blur-3xl opacity-20" style={{ backgroundColor: pkg.id === 'pkg-3' ? '#F59E0B' : '#0F766E' }}></div>
                  
                  {isPopular && (
                    <span className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}

                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[#10B981] font-mono">{pkg.duration} MINUTES SESSION</p>
                      <h3 className="font-display font-bold text-2xl mt-1">{pkg.name}</h3>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold">PKR</span>
                      <span className="text-4xl font-extrabold tracking-tight">{pkg.price.toLocaleString()}</span>
                    </div>

                    <p className={`text-xs leading-relaxed ${isPopular ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {pkg.description}
                    </p>

                    <ul className="space-y-2 text-xs">
                      {pkg.features?.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2.5">
                          <Check className={`w-4 h-4 flex-shrink-0 ${isPopular ? 'text-brand-emerald' : 'text-brand-teal'}`} />
                          <span className={isPopular ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-6">
                    <button
                      onClick={() => handleOpenBooking(pkg)}
                      className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer ${
                        isPopular
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/10'
                          : 'bg-brand-teal text-white hover:bg-opacity-95'
                      }`}
                    >
                      Process Booking Form
                    </button>

                    <button
                      onClick={() => handleWhatsAppDirect(pkg.name)}
                      className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                        isPopular
                          ? 'border border-slate-700 hover:bg-slate-800 text-slate-300'
                          : 'border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4 fill-emerald-500 text-emerald-500" /> WhatsApp Inquiry
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* INTERACTIVE COMPONENT: Karachi Service Areas & Map Overlay */}
        <section id="map" className="space-y-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto space-y-4"
          >
            <h2 className="font-display font-semibold text-3xl md:text-4xl text-slate-900 dark:text-white">
              Karachi Active Service Zones
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-450">
              Hover or click any active zone indicator. Our therapists cover these neighbourhoods 24/7.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Interactive map visualization */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-8 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 height-[340px] md:height-[420px] bg-sky-50 dark:bg-slate-950 relative min-h-[380px]"
            >
              
              {/* Complex stylistic grids and road vectors representing Karachi sea coordinates */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px] dark:[background-size:16px_16px] dark:bg-[radial-gradient(#fff_1px,transparent_1px)]"></div>
              
              {/* Arabian Sea styled area */}
              <div className="absolute bottom-0 left-0 w-[45%] h-[35%] bg-blue-100/30 dark:bg-blue-900/10 rounded-tr-[8rem] border-t border-r border-blue-200/35">
                <span className="absolute bottom-5 left-5 font-mono text-[10px] tracking-widest uppercase font-bold text-slate-400">Arabian Sea Bounds</span>
              </div>

              {/* Glowing Service coordinates pins */}
              {KARACHI_MAP_AREAS.map((pin, i) => (
                <div
                  key={i}
                  style={{ top: pin.coords.top, left: pin.coords.left }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
                >
                  <span className="relative flex h-4.5 w-4.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-brand-emerald border-2 border-white dark:border-slate-900 shadow-md"></span>
                  </span>

                  {/* Pin Description overlay */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-48 p-2.5 rounded-xl bg-slate-900 text-white text-left scale-0 group-hover:scale-100 transition-all duration-300 origin-bottom pointer-events-none shadow-xl border border-slate-800">
                    <p className="font-bold text-xs">{pin.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{pin.desc}</p>
                  </div>
                </div>
              ))}

              {/* Graphic Karachi title card */}
              <div className="absolute top-5 left-5 p-4 rounded-xl glass-panel border border-slate-200/50 shadow-md">
                <h4 className="font-display font-medium text-slate-800 dark:text-white flex items-center gap-1.5 text-sm">
                  <MapPin className="w-4 h-4 text-rose-500" /> Metropolitan Dispatch
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1">DHA · Clifton · PECHS & beyond</p>
              </div>
            </motion.div>

            {/* Area Grid Details */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="font-display font-semibold text-xl text-slate-800 dark:text-slate-100">Covered Neighborhoods</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {KARACHI_MAP_AREAS.map((area, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.94 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.4, delay: (idx % 4) * 0.05, ease: "easeOut" }}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-850 hover:border-brand-emerald bg-white dark:bg-slate-900 transition-all flex items-center gap-2 group"
                  >
                    <span className="w-2 h-2 rounded-full bg-brand-emerald group-hover:scale-125 transition-transform" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{area.name}</span>
                  </motion.div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                ⚠️ Outlying areas such as Malir Cantt and Bahria Town Karachi require scheduled pre-bookings (at least 3 hours prior) to facilitate therapist safety transit.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: Therapist Profiles */}
        <section id="therapists" className="space-y-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto space-y-4"
          >
            <h2 className="font-display font-semibold text-3xl md:text-4xl text-slate-900 dark:text-white">
              Karachi Certified Wellness Roster
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed">
              Every staff member is fully background validated, government certified, and expert in specialized clinical care.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(therapists.length > 0 ? therapists : defaultTherapistsFallback).slice(0, 4).map((th, i) => (
              <motion.div
                key={th.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="space-y-4">
                  {/* Avatar graphic */}
                  <div className="relative w-20 h-20 rounded-2xl bg-brand-teal/5 text-brand-teal dark:text-brand-emerald font-display font-bold text-3xl flex items-center justify-center mx-auto shadow-inner group-hover:scale-105 transition-transform">
                    {th.name.split(' ').map(n => n[0]).join('')}
                    <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full border-2 border-white dark:border-slate-900">
                      <Check className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-white">{th.name}</h3>
                    <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">{th.gender} Professional · {th.experience} Exp</p>
                    <div className="flex justify-center items-center gap-1.5 text-xs text-amber-500 font-semibold pt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> {th.rating}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-50 dark:border-slate-800 text-xs">
                    <p className="text-slate-550 dark:text-slate-400 font-medium">
                      <strong>Languages:</strong> {th.languages.join(', ')}
                    </p>
                    <p className="text-slate-550 dark:text-slate-400 font-medium">
                      <strong>Focus areas:</strong> {th.specialization.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4">
                  <button
                    onClick={() => handleOpenBooking()}
                    className="w-full py-2.5 bg-slate-50 dark:bg-slate-850 dark:hover:bg-slate-800 hover:bg-teal-50/20 text-slate-600 dark:text-slate-300 hover:text-brand-teal font-semibold text-xs rounded-xl transition-all border border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    Match with {th.name.split(' ')[0]}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 6: Testimonials and Review creation */}
        <section id="testimonials" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10">
          
          {/* Reviews list */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-widest font-mono font-bold text-brand-teal dark:text-brand-emerald">Karachi Testimonials</span>
              <h2 className="font-display font-semibold text-3xl text-slate-900 dark:text-white">Reviewed By Families & Professionals</h2>
            </div>

            <div className="space-y-4">
              {(reviews.length > 0 ? reviews : defaultTestimonialsFallback).map((rev, i) => (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 space-y-3 shadow-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-white">{rev.author}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{rev.location} · {rev.date}</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/10">
                      <Star className="w-3 h-3 fill-amber-500" /> {rev.rating}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-350 italic leading-relaxed">"{rev.text}"</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Review form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 p-6 md:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-6"
          >
            <h3 className="font-display font-semibold text-xl text-slate-800 dark:text-white">Share Your Review</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">If you have recently concluded a therapeutic session with Sukoon, please share your rating and area. Your comments help other Karachi families.</p>

            {!reviewSubmitSuccess ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zainab Bibi"
                    value={reviewForm.author}
                    onChange={e => setReviewForm(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Karachi Area</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PECHS"
                      value={reviewForm.location}
                      onChange={e => setReviewForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rating Scale</label>
                    <select
                      value={reviewForm.rating}
                      onChange={e => setReviewForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                      className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-slate-100"
                    >
                      <option value="5">5 Stars — Excellent</option>
                      <option value="4">4 Stars — Good</option>
                      <option value="3">3 Stars — Satisfactory</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Review Text</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your session experience, the hygiene standard, towels, and the therapist skills..."
                    value={reviewForm.text}
                    onChange={e => setReviewForm(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl resize-none dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-teal dark:bg-brand-emerald text-white rounded-xl font-semibold text-xs tracking-wide active:scale-95 transition-all cursor-pointer"
                >
                  Submit review for moderation
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/20 text-center space-y-2">
                <p className="font-bold text-sm text-brand-teal dark:text-brand-emerald">Review Received Successfully!</p>
                <p className="text-xs text-slate-500">To maintain family friendly standards and screen fake comments, your review has been submitted to current operational moderators. It will go live shortly.</p>
              </div>
            )}
          </motion.div>
        </section>

        {/* SECTION 7: SEO Optimized Blogs */}
        <section id="blog" className="space-y-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto space-y-4"
          >
            <h2 className="font-display font-semibold text-3xl md:text-4xl text-slate-900 dark:text-white">
              Sukoon Wellness Portal & Guides
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
              SEO Optimized evidence-led insights written by our internal licensed home healthcare physiologists.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post, i) => (
              <motion.article 
                key={i}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 space-y-4 flex flex-col justify-between group cursor-pointer hover:shadow-lg transition-transform"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase font-bold">
                    <span className="text-brand-teal">{post.tag}</span>
                    <span className="text-slate-400">{post.readTime}</span>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-white group-hover:text-brand-teal transition-all">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-4">
                    {post.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-50 dark:border-slate-805 text-xs font-semibold text-slate-400 group-hover:text-brand-teal dark:group-hover:text-brand-emerald flex items-center gap-1">
                  Read full research paper <Sparkles className="w-3.5 h-3.5" />
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* SECTION 8: FAQ accordion */}
        <section id="faqs" className="space-y-12 max-w-3xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-4"
          >
            <h2 className="font-display font-semibold text-3xl md:text-4xl text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-450">
              Clear, transparent clarifications on our home wellness operations.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 hover:border-slate-200 transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center text-left font-semibold text-sm text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden text-xs text-slate-505 dark:text-slate-400 mt-3.5 leading-relaxed pt-2.5 border-t border-slate-50 dark:border-slate-805"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

      </main>

      {/* SECTION 9: Premium Footer with direct support */}
      <footer className="w-full border-t border-slate-150 dark:border-slate-850 bg-white dark:bg-slate-950 mt-24 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-xs">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-brand-teal text-white rounded-lg font-display font-bold text-md">S</span>
              <span className="font-display font-bold text-xl text-slate-900 dark:text-white">Sukoon.com</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Karachi's premium in-home luxury massage and professional geriatric wellness service. Setting global benchmarks for clinical home-care standardizations.
            </p>
            <div className="pt-2 text-slate-400">
              <p>📍 DHA Phase 6 Main boulevard, Karachi, Pakistan</p>
              <p className="mt-1">📞 Care Helpline: +92 (300) 067-8999</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm tracking-wide uppercase text-slate-400 font-mono">Bespoke Therapies</h4>
            <div className="space-y-2 flex flex-col text-slate-500 dark:text-slate-400">
              <a href="#services" className="hover:text-brand-teal">Seniors Joint Restoration</a>
              <a href="#services" className="hover:text-brand-teal">Deep Tissue Kneading</a>
              <a href="#services" className="hover:text-brand-teal">Office worker Neck Release</a>
              <a href="#services" className="hover:text-brand-teal">Pregnancy Massage</a>
              <a href="#services" className="hover:text-brand-teal">Athletic Stretching</a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm tracking-wide uppercase text-slate-400 font-mono">Company & Legal</h4>
            <div className="space-y-2 flex flex-col text-slate-500 dark:text-slate-400">
              <a href="#blog" className="hover:text-brand-teal">Physiological Research</a>
              <a href="#about" className="hover:text-brand-teal">Clinician Careers</a>
              <a href="#" className="hover:text-brand-teal">Privacy Policy & HIPAA standards</a>
              <a href="#" className="hover:text-brand-teal">Home Care Terms of Use</a>
              <button 
                onClick={() => setShowAdminCenter(true)} 
                className="text-left hover:text-brand-teal cursor-pointer font-bold text-[#F59E0B]"
              >
                Board Operator Login
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase text-slate-400 font-mono">Operational hours</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Our therapists coordinate sessions 24/7. Office booking dispatch officers online for phone consultations 8:00 AM - Midnight.
            </p>
            
            {/* Quick newsletter subscription */}
            <div className="space-y-2 pt-2">
              <p className="font-semibold text-slate-400 font-mono uppercase text-[9px] tracking-wider">Metropolitan newsletter</p>
              <div className="flex gap-1.5">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 w-full"
                />
                <button 
                  onClick={() => alert("Successfully added to our health list.")}
                  className="px-3 bg-brand-teal text-white rounded cursor-pointer"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
          
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-100 dark:border-slate-900 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 font-mono">
          <p>© 2026 Sukoon.com Healthcare Services (Pvt) Ltd. All rights reserved.</p>
          <p>Verified Licensing PMC / PMTB-829. Designed with prestige standards in Karachi.</p>
        </div>
      </footer>

      {/* MOBILE PERSISTENT STICKY CALL ACTION RAIL */}
      <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden flex gap-2 w-[calc(100%-2rem)] max-w-md mx-auto">
        <button
          onClick={() => handleOpenBooking()}
          className="flex-1 py-3.5 bg-brand-teal hover:opacity-95 text-white rounded-2xl shadow-xl font-semibold text-xs tracking-wide transition-all uppercase cursor-pointer"
        >
          Book Appointment
        </button>
        
        <button
          onClick={() => handleWhatsAppDirect()}
          className="py-3.5 px-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 fill-white" /> WhatsApp
        </button>
      </div>

      {/* Main Booking Modal Injection */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedPackage={selectedPkgForBooking}
        allPackages={services.length > 0 ? services : defaultServicesFallback}
      />
    </div>
  );
}

// Fallback arrays to avoid load delays or connection failures in slow mock contexts
const defaultServicesFallback: ServicePackage[] = [
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

const defaultTherapistsFallback: Therapist[] = [
  {
    id: 'th-1',
    name: 'Ali Ahmed',
    gender: 'Male',
    experience: '8 Years',
    certifications: ['Certified Deep Tissue Therapist (PMTB)'],
    languages: ['Urdu', 'English'],
    specialization: ['Deep Tissue Massage', 'Sports Injury Recovery'],
    status: 'Available',
    rating: 4.9,
    completedSessions: 840
  },
  {
    id: 'th-2',
    name: 'Sana Rizvi',
    gender: 'Female',
    experience: '6 Years',
    certifications: ['Diplomatic Swedish practitioner'],
    languages: ['Urdu', 'Sindhi'],
    specialization: ['Aromatherapy Massage', 'Swedish Relaxation'],
    status: 'Available',
    rating: 4.8,
    completedSessions: 610
  }
];

const defaultTestimonialsFallback: ClientReview[] = [
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
  }
];
