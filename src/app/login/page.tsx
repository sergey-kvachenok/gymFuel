'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('Invalid email or password');
      return;
    }
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-8 border"
      >
        <h1 className="text-2xl font-bold text-center mb-2">Sign in</h1>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <div className="space-y-6 flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 px-6 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-base bg-white placeholder-gray-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 px-6 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-base bg-white placeholder-gray-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-base mt-2"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <div className="text-center text-sm mt-4">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </div>
      </form>
    </div>
  );
}
