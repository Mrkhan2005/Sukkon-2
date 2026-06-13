import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Calendar, Sparkles, TrendingUp, DollarSign, 
  Settings, Check, X, ShieldCheck, Lock, Trash2, 
  MessageSquare, UserPlus, RefreshCw, BarChart3, Star, LogOut 
} from 'lucide-react';
import { Booking, Therapist, ServicePackage, ClientReview, DashboardStats } from '../types';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // States of data loaded from server
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'therapists' | 'services' | 'reviews'>('overview');
  
  // Creation States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddTherapist, setShowAddTherapist] = useState(false);
  const [newTherapist, setNewTherapist] = useState({
    name: '',
    gender: 'Female' as 'Male' | 'Female',
    experience: '5 Years',
    specialization: '',
    certifications: '',
    languages: 'Urdu, English',
    status: 'Available' as 'Available' | 'On Duty' | 'Off Duty'
  });

  // Pull all data from servers
  const fetchAllAdminData = async () => {
    setIsRefreshing(true);
    try {
      const [bRes, tRes, sRes, rRes, statsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/therapists'),
        fetch('/api/services'),
        fetch('/api/reviews'),
        fetch('/api/stats')
      ]);

      const [bData, tData, sData, rData, statsData] = await Promise.all([
        bRes.json(),
        tRes.json(),
        sRes.json(),
        rRes.json(),
        statsRes.json()
      ]);

      setBookings(bData);
      setTherapists(tData);
      setServices(sData);
      setReviews(rData);
      setStats(statsData);
    } catch (e) {
      console.error("Failed to load admin metrics", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllAdminData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect Password. Hint: admin123');
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTherapistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: newTherapist.name,
        gender: newTherapist.gender,
        experience: newTherapist.experience,
        languages: newTherapist.languages.split(',').map(s => s.trim()),
        certifications: newTherapist.certifications.split(',').map(s => s.trim()),
        specialization: newTherapist.specialization.split(',').map(s => s.trim()),
        status: newTherapist.status
      };

      const response = await fetch('/api/therapists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowAddTherapist(false);
        setNewTherapist({
          name: '',
          gender: 'Female',
          experience: '5 Years',
          specialization: '',
          certifications: '',
          languages: 'Urdu, English',
          status: 'Available'
        });
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTherapistStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/therapists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTherapist = async (id: string) => {
    if (!confirm("Are you sure you want to retire this therapist profile?")) return;
    try {
      const response = await fetch(`/api/therapists/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateServicePrice = async (id: string, newPrice: number) => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice })
      });
      if (response.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveReview = async (id: string) => {
    try {
      const response = await fetch(`/api/reviews/${id}/approve`, {
        method: 'PUT'
      });
      if (response.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Delete this user review?")) return;
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div id="admin-login-screen" className="max-w-md mx-auto my-16 p-8 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 text-center space-y-6 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-brand-teal/10 dark:bg-brand-emerald/10 text-brand-teal dark:text-brand-emerald flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="font-display font-semibold text-2xl text-slate-800 dark:text-slate-100">Sukoon HQ Gate</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Restricted to board operators and customer care coordinators</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-slate-500">Security Password</label>
            <input
              type="password"
              placeholder="Enter gate password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-teal"
            />
          </div>

          {authError && <p className="text-xs text-rose-500 font-medium">{authError}</p>}

          <button
            type="submit"
            className="w-full py-3.5 bg-brand-teal dark:bg-brand-emerald hover:opacity-95 text-white rounded-xl shadow-lg font-semibold text-sm cursor-pointer transition-all"
          >
            Authenticate Portal
          </button>
        </form>
        <p className="text-[10px] text-slate-400">Secret Hint: <code className="bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-0.5">admin123</code></p>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-panel" className="w-full space-y-6">
      {/* Upper Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <h2 className="font-display font-semibold text-2xl text-slate-800 dark:text-slate-100">Command Center Dashboard</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Real-time Karachi operation analytics and client management.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllAdminData}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all flex items-center gap-2 text-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Update Server Data
          </button>
          
          <button
            onClick={() => setIsAuthenticated(false)}
            className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 transition-all flex items-center gap-2 text-xs cursor-pointer font-bold"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Numerical Stats overview */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Live Bookings</span>
              <Calendar className="w-4.5 h-4.5 text-brand-teal" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.totalBookings}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-semibold">
                <span>{stats.pendingBookings} Pending Moderation</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Releasing Revenue</span>
              <DollarSign className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">PKR {stats.totalRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span>Projected: PKR {stats.projectedRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Therapist Force</span>
              <Users className="w-4.5 h-4.5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{therapists.length}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-blue-500 font-semibold">
                <span>{stats.activeTherapists} Available / On-duty</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Conv Rate (WhatsApp)</span>
              <TrendingUp className="w-4.5 h-4.5 text-brand-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.whatsappClicks}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-brand-gold font-semibold">
                <span>{stats.averageRating}★ average customer rating</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        {[
          { id: 'overview', label: 'Overviews & Analytics', icon: BarChart3 },
          { id: 'bookings', label: `Appointments (${bookings.length})`, icon: Calendar },
          { id: 'therapists', label: `Staff Therapists (${therapists.length})`, icon: Users },
          { id: 'services', label: 'Services & Rates', icon: Sparkles },
          { id: 'reviews', label: `Reviews & Moderation (${reviews.length})`, icon: MessageSquare }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                isActive 
                  ? 'border-brand-teal text-brand-teal dark:border-brand-emerald dark:text-brand-emerald' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels with beautiful layouts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm min-h-[350px]">
        
        {/* Tab 1: Overview and Charts */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="font-display font-semibold text-xl text-slate-800 dark:text-slate-100">Live Karachi Operations Analytics</h3>
            
            {/* Simple Dynamic Data Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase font-mono">Real-Time Booking Status Distribution</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Pending Moderation', count: bookings.filter(b => b.status === 'Pending').length, color: 'bg-amber-400' },
                    { label: 'Confirmed', count: bookings.filter(b => b.status === 'Confirmed').length, color: 'bg-teal-500' },
                    { label: 'Completed Care', count: bookings.filter(b => b.status === 'Completed').length, color: 'bg-emerald-500' },
                    { label: 'Cancelled', count: bookings.filter(b => b.status === 'Cancelled').length, color: 'bg-slate-300' }
                  ].map((bar, i) => {
                    const total = bookings.length || 1;
                    const pct = Math.round((bar.count / total) * 100);
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-600 dark:text-slate-400">{bar.label} ({bar.count})</span>
                          <span className="text-slate-400">{pct}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-50 dark:bg-slate-950 rounded-full overflow-hidden">
                          <div className={`h-full ${bar.color}`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase font-mono">Completed Sessions Progress Matrix</h4>
                <div className="space-y-3 max-h-[220px] overflow-y-auto">
                  {therapists.map((therapist) => (
                    <div key={therapist.id} className="flex items-center justify-between text-xs font-medium border-b border-slate-50 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-teal/10 dark:bg-brand-emerald/10 text-brand-teal dark:text-brand-emerald font-bold flex items-center justify-center">
                          {therapist.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100">{therapist.name}</p>
                          <p className="text-[10px] text-slate-450">{therapist.gender} · {therapist.experience}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800 dark:text-slate-100">{therapist.completedSessions} Sessions</p>
                        <p className="text-[10px] text-amber-500 font-semibold">{therapist.rating}★ rating</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick action help note */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              💡 <strong>System Management Guide:</strong> Navigate and tap into secondary tabs. You can approve user testimonials, change massage package prices instantly, update client reservation statuses to "Confirmed" once you talk on WhatsApp, or provision profiles for newly trained therapists.
            </div>
          </div>
        )}

        {/* Tab 2: Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-xl text-slate-800 dark:text-slate-100">Client Appointment List ({bookings.length})</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-850 text-xs uppercase tracking-wider font-mono text-slate-400">
                    <th className="py-3 px-2">Patient/Client</th>
                    <th className="py-3 px-2">Chosen Package</th>
                    <th className="py-3 px-2">Location</th>
                    <th className="py-3 px-2">Schedule Slip</th>
                    <th className="py-3 px-2">Booking Status</th>
                    <th className="py-3 px-2 text-right">Moderator Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850 text-xs">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30">
                      <td className="py-4.5 px-2">
                        <p className="font-bold text-slate-850 dark:text-slate-200">{booking.name}</p>
                        <p className="text-[10px] text-slate-400">P: {booking.phone} / WA: {booking.whatsapp}</p>
                      </td>
                      <td className="py-4.5 px-2 font-semibold text-brand-teal dark:text-brand-emerald">
                        {booking.serviceType} <span className="text-[10px] text-slate-400 block font-normal">PKR {booking.price.toLocaleString()}</span>
                      </td>
                      <td className="py-4.5 px-2">{booking.location}</td>
                      <td className="py-4.5 px-2">
                        <span className="block font-semibold">{booking.preferredDate}</span>
                        <span className="text-slate-400 block">{booking.preferredTime}</span>
                      </td>
                      <td className="py-4.5 px-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          booking.status === 'Pending' ? 'bg-amber-100/70 text-amber-800 dark:bg-amber-950/35 dark:text-amber-300' :
                          booking.status === 'Confirmed' ? 'bg-teal-100 text-brand-teal dark:bg-teal-950/40 dark:text-emerald-300' :
                          booking.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200' :
                          'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-4.5 px-2 text-right">
                        <div className="flex justify-end gap-1.5">
                          {booking.status === 'Pending' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, 'Confirmed')}
                              className="px-2 py-1 rounded bg-teal-500 text-white font-bold hover:bg-teal-600 cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {booking.status === 'Confirmed' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, 'Completed')}
                              className="px-2 py-1 rounded bg-emerald-500 text-white font-bold hover:bg-emerald-600 cursor-pointer"
                            >
                              Complete
                            </button>
                          )}
                          {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, 'Cancelled')}
                              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        No Client reservations stored inside JSON db currently.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Therapists */}
        {activeTab === 'therapists' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-semibold text-xl text-slate-800 dark:text-slate-100">Home Care Therapist Roster ({therapists.length})</h3>
              <button
                onClick={() => setShowAddTherapist(true)}
                className="px-3 py-1.5 bg-brand-teal dark:bg-brand-emerald hover:opacity-90 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Recruit Therapist
              </button>
            </div>

            {/* Addition drawer standard */}
            <AnimatePresence>
              {showAddTherapist && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddTherapistSubmit}
                  className="p-5 border border-teal-100 dark:border-slate-800 rounded-xl bg-teal-50/20 dark:bg-slate-950/30 grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase font-mono">Therapist Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Bibi"
                      value={newTherapist.name}
                      onChange={e => setNewTherapist(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase font-mono">Gender Group</label>
                    <select
                      value={newTherapist.gender}
                      onChange={e => setNewTherapist(prev => ({ ...prev, gender: e.target.value as any }))}
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded"
                    >
                      <option value="Female">Female (Recommended care for women)</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase font-mono">Years Experience</label>
                    <input
                      type="text"
                      placeholder="e.g. 7 Years"
                      value={newTherapist.experience}
                      onChange={e => setNewTherapist(prev => ({ ...prev, experience: e.target.value }))}
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase font-mono">Speciality (comma separated)</label>
                    <input
                      type="text"
                      placeholder="Elderly care, Swedish, Back Relief"
                      value={newTherapist.specialization}
                      onChange={e => setNewTherapist(prev => ({ ...prev, specialization: e.target.value }))}
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase font-mono">Licences / Certifications</label>
                    <input
                      type="text"
                      placeholder="Govt Certified Physiotherapy Diploma"
                      value={newTherapist.certifications}
                      onChange={e => setNewTherapist(prev => ({ ...prev, certifications: e.target.value }))}
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded"
                    />
                  </div>

                  <div className="space-y-1.5 flex justify-end items-end gap-2 md:col-span-3">
                    <button
                      type="button"
                      onClick={() => setShowAddTherapist(false)}
                      className="p-2 border border-slate-300 dark:border-slate-800 rounded text-xs text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="p-2 bg-brand-teal text-white rounded text-xs font-bold"
                    >
                      Save Recruit Record
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {therapists.map(t => (
                <div key={t.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-805 space-y-3 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        t.status === 'Available' ? 'bg-emerald-500' : t.status === 'On Duty' ? 'bg-sky-500' : 'bg-slate-300'
                      }`}></span>
                      <h4 className="font-bold text-md text-slate-850 dark:text-slate-100">{t.name} ({t.gender})</h4>
                    </div>
                    <p className="text-xs text-slate-400 font-mono font-medium">{t.experience} Experience · {t.completedSessions} sessions done</p>
                    
                    <div className="mt-2 space-y-1">
                      <p className="text-xs"><strong>Specializes:</strong> {t.specialization.join(', ')}</p>
                      <p className="text-xs text-slate-500"><strong>Certs:</strong> {t.certifications.join(', ')}</p>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <select
                      value={t.status}
                      onChange={(e) => handleUpdateTherapistStatus(t.id, e.target.value)}
                      className="text-[10px] p-1 rounded border border-slate-200 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <option value="Available">Available</option>
                      <option value="On Duty">On Duty</option>
                      <option value="Off Duty">Off Duty</option>
                    </select>

                    <button
                      onClick={() => handleDeleteTherapist(t.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 block ml-auto"
                      title="Retire profile"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Services */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-xl text-slate-800 dark:text-slate-100">Bespoke Treatment Rates & Catalogs</h3>
            <p className="text-xs text-slate-400">Alter current pricing structures. The updated numbers will reflect instantly across packages.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map(s => (
                <div key={s.id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <div>
                    <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{s.name}</h4>
                    <span className="text-xs font-mono text-slate-400">{s.duration} Minutes Session</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">{s.description}</p>
                  
                  <div className="space-y-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                    <label className="text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider block">Set PKR Price</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">PKR</span>
                      <input
                        type="number"
                        value={s.price}
                        onChange={(e) => handleUpdateServicePrice(s.id, parseInt(e.target.value))}
                        className="w-full text-sm font-semibold p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-teal"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-xl text-slate-800 dark:text-slate-100">Client Reviews Moderation</h3>
            <p className="text-xs text-slate-400">Only toggled "Approved" reviews will appear in the customer slide-carousels on the landing page.</p>

            <div className="space-y-3.5">
              {reviews.map(r => (
                <div key={r.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/10 flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{r.author} ({r.location})</span>
                      <span className="text-slate-400 text-[10px]">{r.date}</span>
                      <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500" /> {r.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-350 italic">"{r.text}"</p>
                  </div>

                  <div className="flex items-center gap-2 self-center">
                    <button
                      onClick={() => handleApproveReview(r.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        r.approved 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}
                    >
                      {r.approved ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      {r.approved ? 'Approved' : 'Pending'}
                    </button>

                    <button
                      onClick={() => handleDeleteReview(r.id)}
                      className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-500 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {reviews.length === 0 && (
                <p className="text-center py-10 text-slate-400 text-xs">No client reviews in the database files.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
