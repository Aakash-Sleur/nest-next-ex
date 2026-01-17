'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

// Extend the Session type to include accessToken
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}

export function useAuth() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.accessToken) {
        try {
          const userData = await apiClient.get('/auth/profile', session.accessToken as string);
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
      setLoading(false);
    };

    if (status !== 'loading') {
      fetchUser();
    }
  }, [session, status]);

  return {
    user,
    session,
    loading: status === 'loading' || loading,
    isAuthenticated: !!session,
  };
}