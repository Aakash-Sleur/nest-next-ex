import SignInButton from "@/components/auth/SignInButton";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Welcome to Next.js + NestJS Auth Demo
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              This demo showcases Google OAuth authentication with NextAuth.js frontend and NestJS backend with Supabase and JWT.
            </p>
            
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Authentication</h2>
              <SignInButton />
            </div>

            <div className="flex justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/auth/signin"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Sign In Page
              </Link>
            </div>

            <div className="mt-12 text-left max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Features Implemented:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Google OAuth authentication with NextAuth.js</li>
                <li>NestJS backend with JWT token generation</li>
                <li>Supabase integration for user management</li>
                <li>Automatic user creation on first login</li>
                <li>Protected routes and API endpoints</li>
                <li>Session management with JWT</li>
                <li>CORS configuration for frontend-backend communication</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
