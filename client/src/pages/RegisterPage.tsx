import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, error, clearError, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Error is handled by authStore
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (error) {
      clearError();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-khc-primary to-khc-secondary flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">QSCostingPro</h1>
          <p className="text-khc-light">Professional Cost Estimation for Quantity Surveyors</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-lg p-8" style={{boxShadow: '0 30px 80px 10px rgba(0, 0, 0, 0.35), 0 15px 40px 5px rgba(0, 0, 0, 0.2), 0 0 60px rgba(0, 0, 0, 0.2)', transform: 'translateY(-12px)'}}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-khc-primary flex-1 text-center">Create Account</h2>
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-700 transition text-lg font-semibold"
              title="Back to home"
            >
              ←
            </Link>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-khc-neutral mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Choose a username"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary ${
                  validationErrors.username ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {validationErrors.username && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-khc-neutral mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {validationErrors.email && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-khc-neutral mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password (min 8 characters)"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary ${
                  validationErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {validationErrors.password && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-khc-neutral mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-khc-primary ${
                  validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {validationErrors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-all ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-khc-primary hover:bg-khc-secondary active:scale-95'
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-khc-neutral">
            Already have an account?{' '}
            <Link to="/login" className="text-khc-primary hover:underline font-medium">
              Sign in here
            </Link>
          </div>
        </div>

        {/* Info Message */}
        <div className="mt-6 p-4 bg-white/10 rounded-lg text-khc-light text-sm">
          <p className="text-xs">
            <strong>Note:</strong> After registration, you can add clients and contractors from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
