import SignInButton from '@/components/auth/SignInButton';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use your Google account to sign in
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <SignInButton />
        </div>
      </div>
    </div>
  );
}