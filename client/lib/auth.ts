import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

declare module 'next-auth' {
  interface User {
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Send user data to your NestJS backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: user.id,
              email: user.email,
              name: user.name,
              picture: user.image,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            // Store the JWT token in the user object
            user.accessToken = data.access_token;
            return true;
          }
        } catch (error) {
          console.error('Error during sign in:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account && user) {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
};