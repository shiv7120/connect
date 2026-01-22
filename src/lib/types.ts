export type Testimonial = {
  id: number;
  name: string;
  location: string;
  quote: string;
  rating: number;
  imageId: string;
};

export type PricingPlan = {
  id: string;
  title: string;
  description: string;
  price: number;
  features: string[];
  isPopular?: boolean;
};

export type Mentor = {
  id: string;
  name: string;
  subjects: string[];
  gradeLevels: string[];
  rating: number;
  reviewCount: number;
  experience: string;
  location: string;
  language: string;
  price: number;
  isVerified: boolean;
  imageId: string;
  availability: string[];
};

export type Session = {
  id: string;
  mentorName: string;
  date: string;
  subject: string;
  status: 'Completed' | 'Upcoming' | 'Cancelled';
};

export type ProgressReport = {
  month: string;
  Math: number;
  Science: number;
  English: number;
};

export type Earnings = {
  month: string;
  amount: number;
};
