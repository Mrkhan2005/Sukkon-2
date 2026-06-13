import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, MapPin, Phone, User, MessageCircle, MessageSquare, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ServicePackage } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage?: ServicePackage | null;
  allPackages: ServicePackage[];
}

const KARACHI_AREAS = [
  'DHA', 'Clifton', 'Gulshan', 'Gulistan-e-Johar', 
  'North Nazimabad', 'PECHS', 'Bahadurabad', 
  'Saddar', 'Malir', 'Bahria Town Karachi'
];

export default function BookingModal({ isOpen, onClose, selectedPackage, allPackages }: BookingModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    location: '',
    serviceType: selectedPackage?.name || '',
    preferredDate: '',
    preferredTime: '',
    specialNotes: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  React.useEffect(() => {
    if (selectedPackage) {
      setFormData(prev => ({ ...prev, serviceType: selectedPackage.name }));
    } else if (allPackages.length > 0 && !formData.serviceType) {
      setFormData(prev => ({ ...prev, serviceType: allPackages[0].name }));
    }
  }, [selectedPackage, allPackages]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getWhatsAppMessage = (booking: any) => {
    return `Hello Sukoon Team,

I would like to book a home session:
- *Package*: ${booking.serviceType}
- *Price*: PKR ${booking.price.toLocaleString()}
- *Preferred Date*: ${booking.preferredDate}
- *Preferred Time*: ${booking.preferredTime}
- *Location/Area*: ${booking.location}
- *My Name*: ${booking.name}
- *Notes*: ${booking.specialNotes || 'None'}

Please confirm availability of a therapist!`;
  };

  const handleWhatsAppRedirect = async (booking: any) => {
    try {
      // Track the conversion click in our backend stats
      await fetch('/api/stats/whatsapp', { method: 'POST' });
    } catch (e) {
      console.warn("Analytics tracking failure.", e);
    }

    const message = encodeURIComponent(getWhatsAppMessage(booking));
    // Support Pakistani format or business number
    const whatsappUrl = `https://wa.me/923000678999?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.whatsapp || !formData.location || !formData.serviceType || !formData.preferredDate || !formData.preferredTime) {
      alert("Please populate all crucial information (marked with *).");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setBookingResult(data);
        setSuccess(true);
        // Clear state
        setFormData({
          name: '',
          phone: '',
          whatsapp: '',
          location: '',
          serviceType: '',
          preferredDate: '',
          preferredTime: '',
          specialNotes: ''
        });
      } else {
        alert(data.error || "Execution failed. Please retry.");
      }
    } catch (err) {
      console.error(err);
      alert("Connect issues. Express server backend loaded?");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="booking-modal-holder" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0B1120]/70 backdrop-blur-md"
        />

        {/* Modal Main Board */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl z-10 border border-slate-100 dark:border-slate-800"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {!success ? (
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-brand-teal/10 dark:bg-brand-emerald/10 text-brand-teal dark:text-brand-emerald">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="font-display font-semibold text-2xl text-slate-800 dark:text-slate-100">Bespoke Session Booking</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Secure your home relaxation appointment with professional, DHA background-checked wellness experts in Karachi.
                </p>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full text-sm bg-slate-50 dark:bg-slate-850 hover:bg-slate-100/50 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal dark:focus:ring-brand-emerald rounded-xl px-4 py-3 dark:text-slate-200 transition-all"
                  />
                </div>

                {/* Karachi Area location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Service Area (Karachi) *
                  </label>
                  <select
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal dark:focus:ring-brand-emerald rounded-xl px-4 py-3 dark:text-slate-200 transition-all"
                  >
                    <option value="">Select your area</option>
                    {KARACHI_AREAS.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                {/* Mobile Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="03001234567"
                    className="w-full text-sm bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal dark:focus:ring-brand-emerald rounded-xl px-4 py-3 dark:text-slate-200 transition-all"
                  />
                </div>

                {/* WhatsApp Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="Same or different"
                    className="w-full text-sm bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal dark:focus:ring-brand-emerald rounded-xl px-4 py-3 dark:text-slate-200 transition-all"
                  />
                </div>

                {/* Selected Package */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    Service Package *
                  </label>
                  <select
                    name="serviceType"
                    required
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal dark:focus:ring-brand-emerald rounded-xl px-4 py-3 dark:text-slate-200 transition-all font-semibold text-brand-teal dark:text-brand-emerald"
                  >
                    {allPackages.map(pkg => (
                      <option key={pkg.id} value={pkg.name}>
                        {pkg.name} — PKR {pkg.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preferred Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Preferred Date *
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    required
                    value={formData.preferredDate}
                    onChange={handleChange}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal dark:focus:ring-brand-emerald rounded-xl px-4 py-3 dark:text-slate-200 transition-all"
                  />
                </div>

                {/* Preferred Time */}
                <div className="grid grid-cols-1 col-span-1 md:col-span-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Preferred Slot *
                    </label>
                    <select
                      name="preferredTime"
                      required
                      value={formData.preferredTime}
                      onChange={handleChange}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal dark:focus:ring-brand-emerald rounded-xl px-4 py-3 dark:text-slate-200"
                    >
                      <option value="">Choose a slot</option>
                      <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                      <option value="Afternoon (12:00 PM - 3:00 PM)">Afternoon (12:00 PM - 3:00 PM)</option>
                      <option value="Late Afternoon (3:00 PM - 6:00 PM)">Late Afternoon (3:00 PM - 6:00 PM)</option>
                      <option value="Evening (6:00 PM - 9:00 PM)">Evening (6:00 PM - 9:00 PM)</option>
                      <option value="Late Night (9:00 PM - Midnight)">Late Night (9:00 PM - Midnight)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Any medical notes or therapist preference? (Optional)
                </label>
                <textarea
                  name="specialNotes"
                  value={formData.specialNotes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. Please send a female specialist for an elderly lady, prefer soft pressure, etc."
                  className="w-full text-sm bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-teal dark:focus:ring-brand-emerald rounded-xl px-4 py-3 dark:text-slate-200 transition-all resize-none"
                />
              </div>

              {/* Secure standard note */}
              <div className="p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100/30 dark:border-teal-900/30 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <ShieldAlert className="w-4 h-4 text-brand-teal dark:text-brand-emerald flex-shrink-0 mt-0.5" />
                <p>
                  <strong>No Upfront Charges Required:</strong> You will pay locally in cash or online bank transfers after your therapeutic session concludes. All therapists are fully background checked.
                </p>
              </div>

              {/* Trigger submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-gradient-to-r from-brand-teal to-brand-emerald hover:opacity-95 active:scale-95 text-white font-semibold text-sm rounded-xl shadow-lg shadow-teal-700/10 dark:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          ) : (
            // Integration Success panel
            <div className="p-10 text-center space-y-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-12 h-12" />
              </motion.div>

              <div className="space-y-2">
                <h3 className="font-display font-semibold text-2xl text-slate-800 dark:text-slate-100">Booking Form Saved!</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Assalamu Alaikum, <strong>{bookingResult?.name}</strong>. Your session for <strong>{bookingResult?.serviceType}</strong> has been logged inside our database securely.
                </p>
              </div>

              {/* Action items */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 max-w-md mx-auto text-left">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-mono">Details summary:</p>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-350">
                  <p>🗓️ <strong>Selected Date:</strong> {bookingResult?.preferredDate}</p>
                  <p>⏰ <strong>Slot:</strong> {bookingResult?.preferredTime}</p>
                  <p>📍 <strong>Karachi Area:</strong> {bookingResult?.location}</p>
                  <p>💵 <strong>Price Check:</strong> PKR {bookingResult?.price?.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 max-w-md mx-auto">
                <button
                  onClick={() => handleWhatsAppRedirect(bookingResult)}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 active:scale-95 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-white" /> Connect via WhatsApp Now
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-3.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-300 font-semibold text-xs rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  Return to Website
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
