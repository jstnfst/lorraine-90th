export interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  banned: boolean;
}

export interface Question {
  id: number;
  user_id: string;
  user_name: string;
  user_email: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
}

export interface Rsvp {
  id: number;
  name: string;
  email: string;
  confirmed: boolean;
  created_at: string;
}

export interface Photo {
  id: number;
  user_id: string;
  user_name: string;
  key: string;
  created_at: string;
}
