import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const {
    user,
    accessToken,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
    clearError,
  } = useAuthStore();

  return {
    // State
    user,
    accessToken,
    isLoading,
    error,
    isAuthenticated: !!user,

    // Actions
    login,
    register,
    logout,
    refreshToken,
    clearError,

    // Helpers
    isAdmin: user?.role === 'admin',
    isEstimator: user?.role === 'estimator',
    isViewer: user?.role === 'viewer',
    hasPermission: (requiredRole: string | string[]) => {
      if (!user) return false;
      if (Array.isArray(requiredRole)) {
        return requiredRole.includes(user.role);
      }
      return user.role === requiredRole;
    },
  };
}
