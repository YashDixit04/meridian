import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authService } from '../../services/authService';
import { ApiException } from '@/lib/apiClient';
import { Mail, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginSignupProps {
  onLoginSuccess: () => void;
  onRegisterVendor?: () => void;
}

const LoginSignup: React.FC<LoginSignupProps> = ({ onLoginSuccess, onRegisterVendor }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loginAudience, setLoginAudience] = useState<'user' | 'vendor'>('user');
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({ usernameOrEmail: '', username: '', email: '', password: '', confirmPassword: '' });
  };

  const handleRegisterVendor = () => {
    if (onRegisterVendor) {
      onRegisterVendor();
      return;
    }

    navigate('/vendor-register');
  };

  const handleAudienceSwitch = (audience: 'user' | 'vendor') => {
    setLoginAudience(audience);
    setError('');
    resetForm();

    if (audience === 'vendor') {
      setIsLogin(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session = await authService.login(formData.usernameOrEmail, formData.password);
      if (session) {
        onLoginSuccess();
      } else {
        setError('Invalid username/email or password');
      }
    } catch {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    if (!formData.username || !formData.email || !formData.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const success = await authService.signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        roleType: 'tenantadmin',
        permissions: {
          pages: ['dashboard', 'tenantVessels', 'tenantOrders'],
          fields: {
            vesselTable: ['name', 'type', 'status'],
            orderTable: ['orderId', 'date', 'status'],
          },
        },
      });

      if (!success) {
        setError('Username or email already exists');
        return;
      }

      setIsLogin(true);
      setError('');
      alert('Account created successfully! Please log in.');
      setFormData({ usernameOrEmail: '', username: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.errorMessage);
      } else {
        setError('An error occurred during signup. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    resetForm();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7)), url('/loginpageimage2.png')`
      }}
    >
      <div className="max-w-[370px] w-full">
        {/* Glass Card */}
        <div
          className="rounded-2xl p-8 border border-white/20"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-white/10 p-1">
              <button
                type="button"
                onClick={() => handleAudienceSwitch('user')}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${loginAudience === 'user'
                    ? 'bg-white text-black'
                    : 'text-white/80 hover:bg-white/10'
                  }`}
              >
                Login as User
              </button>
              <button
                type="button"
                onClick={() => handleAudienceSwitch('vendor')}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${loginAudience === 'vendor'
                    ? 'bg-white text-black'
                    : 'text-white/80 hover:bg-white/10'
                  }`}
              >
                Login as Vendor
              </button>
            </div>

            <h2 className="text-xl font-bold text-white">
              {isLogin ? (loginAudience === 'vendor' ? 'Vendor Sign in' : 'Sign in') : 'Sign up'}
            </h2>
            <p className="pt-2 text-sm text-white/60">
              {isLogin ? (
                loginAudience === 'vendor' ? (
                  <>
                    New vendor?{' '}
                    <button onClick={handleRegisterVendor} className="text-primary font-semibold hover:underline">
                      Register as vendor
                    </button>
                  </>
                ) : (
                  <>
                    Need an account?{' '}
                    <button onClick={toggleMode} className="text-primary font-semibold hover:underline">
                      Sign up
                    </button>
                  </>
                )
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={toggleMode} className="text-primary font-semibold hover:underline">
                    Login
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Social Buttons — shown on both login and signup */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-black/50 transition-all duration-200 hover:bg-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.62)',
                border: '1px solid rgba(255, 255, 255, 0.63)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
              </svg>
              Use Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-black/50 transition-all duration-200 hover:bg-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.62)',
                border: '1px solid rgba(255, 255, 255, 0.63)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="black">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Use Apple
            </button>
          </div>

          {/* OR Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-xs font-semibold text-white/40 tracking-widest">OR</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Email</label>
                <Input
                  name="usernameOrEmail"
                  type="text"
                  placeholder="email@email.com"
                  value={formData.usernameOrEmail}
                  onChange={handleInputChange}
                  leftIcon={<User size={18} />}
                  size="medium"
                  required
                  className="bg-white/10 border border-white/20 text-white placeholder:text-white/30 backdrop-blur-sm focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-white/80">Password</label>
                  <button type="button" className="text-sm text-primary hover:underline font-medium">
                    Forgot Password?
                  </button>
                </div>
                <Input
                  name="password"
                  type="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  leftIcon={<Lock size={18} />}
                  size="medium"
                  required
                  className="bg-white/10 border border-white/20 text-white placeholder:text-white/30 backdrop-blur-sm focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div className="w-4 h-4 rounded border-2 border-white/30 flex items-center justify-center bg-white/10 flex-shrink-0" />
                <span className="text-sm text-white/70">Remember me</span>
              </label>

              <Button
                type="submit"
                variant="solid"
                color="primary"
                size="medium"
                className="w-full !rounded-xl"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              {loginAudience === 'vendor' ? (
                <div className="mt-2 p-3 rounded-lg border border-primary/30 bg-primary/10">
                  <p className="text-white/85 text-xs mb-2">Register your vendor profile and submit KYC for approval.</p>
                  <button
                    type="button"
                    onClick={handleRegisterVendor}
                    className="text-primary text-xs font-semibold hover:underline"
                  >
                    Register as Vendor
                  </button>
                </div>
              ) : (
                <div
                  className="mt-2 p-3 rounded-lg border border-info/20"
                  style={{ background: 'rgba(73, 33, 234, 0.1)' }}
                >
                  <p className="text-info text-xs font-medium mb-1">Default Superadmin Credentials:</p>
                  <p className="text-white/50 text-xs">Email: <span className="font-mono">superadmin@gmail.com</span></p>
                  <p className="text-white/50 text-xs">Password: <span className="font-mono">123456</span></p>
                </div>
              )}
            </form>
          ) : (
            /* Signup Form */
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="email@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  leftIcon={<Mail size={18} />}
                  size="medium"
                  required
                  className="bg-white/10 border border-white/20 text-white placeholder:text-white/30 backdrop-blur-sm focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
                <Input
                  name="password"
                  type="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  leftIcon={<Lock size={18} />}
                  size="medium"
                  required
                  className="bg-white/10 border border-white/20 text-white placeholder:text-white/30 backdrop-blur-sm focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Confirm Password</label>
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  leftIcon={<Lock size={18} />}
                  size="medium"
                  required
                  className="bg-white/10 border border-white/20 text-white placeholder:text-white/30 backdrop-blur-sm focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Terms */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div className="w-4 h-4 rounded border-2 border-white/30 flex items-center justify-center bg-white/10 flex-shrink-0" />
                <span className="text-sm text-white/70">
                  I accept{' '}
                  <button type="button" className="text-primary hover:underline font-medium">
                    Terms &amp; Conditions
                  </button>
                </span>
              </label>

              <Button
                type="submit"
                variant="solid"
                color="primary"
                size="medium"
                className="w-full !rounded-xl"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;