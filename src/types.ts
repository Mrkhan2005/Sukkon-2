export interface Booking {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  location: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  specialNotes?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  packageName: string;
  price: number;
  createdAt: string;
}

export interface Therapist {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  experience: string;
  certifications: string[];
  languages: string[];
  specialization: string[];
  status: 'Available' | 'On Duty' | 'Off Duty';
  rating: number;
  completedSessions: number;
  photoUrl?: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number; // PKR
  description: string;
  features: string[];
  glowColor: string;
}

export interface ClientReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  location: string;
  approved: boolean;
}

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  projectedRevenue: number;
  activeTherapists: number;
  averageRating: number;
  whatsappClicks: number;
}
