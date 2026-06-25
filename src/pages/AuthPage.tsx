import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Home, Mail, Lock, User, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Neighborhood } from '../types';

export default function AuthPage() {
  const [params] = useSearchParams();
  const isSignUp = params.get('mode') === 'signup';
  const [mode, setMode] = useState<'signin' | 'signup'>(isSignUp ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [neighborhoodId, setNeighborhoodId] = useState('');
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    supabase.from('neighborhoods').select('*').order('name').then(({ data }) => {
      if (data) setNeighborhoods(data as Neighborhood[]);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      if (!name || !neighborhoodId) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, name, neighborhoodId);
      if (error) setError(error);
      else navigate('/');
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 items-center justify-center mb-3">
            <Home className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl">
            {mode === 'signin' ? 'Welcome back' : 'Join your neighborhood'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'signin' ? 'Sign in to continue to NeighborHub' : 'Create an account to get started'}
          </p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input pl-10"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Neighborhood</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={neighborhoodId}
                    onChange={(e) => setNeighborhoodId(e.target.value)}
                    className="input pl-10"
                    required
                  >
                    <option value="">Select your neighborhood</option>
                    {neighborhoods.map((nb) => (
                      <option key={nb.id} value={nb.id}>{nb.name}, {nb.city}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
              className="text-primary-600 font-medium hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          <Link to="/" className="hover:underline">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
