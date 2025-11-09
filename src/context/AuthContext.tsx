'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CURRENT_USER } from '@/lib/graphql/queries';
import { LOGIN } from '@/lib/graphql/mutations';
import { setAuthToken, removeAuthToken, getAuthToken } from '@/lib/auth';
import { User } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  
  const hasToken = typeof window !== 'undefined' ? !!getAuthToken() : false;

  const { data, loading, error, refetch } = useQuery(GET_CURRENT_USER, {
    skip: !hasToken,
    fetchPolicy: 'network-only', // Always fetch fresh data
  });

  const [loginMutation] = useMutation(LOGIN);

  // Handle initialization and data updates
  useEffect(() => {
    if (!hasToken) {
      setInitializing(false);
      setUser(null);
      return;
    }

    if (loading) {
      return; // Still loading
    }

    if (data?.currentUser) {
      setUser(data.currentUser);
      setInitializing(false);
    } else if (error) {
      removeAuthToken();
      setUser(null);
      setInitializing(false);
    } else {
      setInitializing(false);
    }
  }, [hasToken, data, loading, error]);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { email, password },
      });

      if (data?.login) {
        setAuthToken(data.login);
        await refetch();
        toast.success('Logged in successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const refetchUser = () => {
    refetch();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: loading || initializing,
        login,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

