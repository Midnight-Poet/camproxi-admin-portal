import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation, useGetMeQuery } from '../features/api/authApi';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { setCredentials } from '../features/auth/authSlice';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const dispatch = useDispatch();
  
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Try to fetch session on mount. If it succeeds, the user is already logged in!
  const { data: sessionData, isLoading: isSessionLoading } = useGetMeQuery(undefined, { skip: isAuthenticated });

  useEffect(() => {
    // Redirect if they are already authenticated via Redux OR if the session fetch succeeded
    if (isAuthenticated || (sessionData && sessionData.id)) {
      if (sessionData && sessionData.id) {
        dispatch(setCredentials({ user: sessionData }));
      }
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, sessionData, navigate, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const result = await login({ email, password }).unwrap();
      
      dispatch(setCredentials({ user: result.user }));
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login failed', err);
      setErrorMsg(err?.data?.message || 'Invalid email or password. Please try again.');
    }
  };

  if (isSessionLoading) {
    return <div className="min-h-screen bg-[var(--color-bg-main)] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background design elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-primary)] opacity-5 blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-success)] opacity-5 blur-3xl"></div>

      <Card className="max-w-md w-full space-y-8 p-10 relative z-10 shadow-xl border-white/20 bg-white/80 backdrop-blur-md">
        <div>
          <img src="/favicon.svg" alt="Camproxi Admin" className="mx-auto w-16 h-16 object-contain" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Camproxi Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the administration console
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">
                  {errorMsg}
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all sm:text-sm"
                placeholder="Admin Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center py-3"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
