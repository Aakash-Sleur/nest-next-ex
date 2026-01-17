export interface User {
  id: string;
  email: string;
  name: string;
  google_id?: string;
  avatar?: string;
  email_verified: boolean;
  provider: string;
  created_at: string;
  updated_at: string;
}