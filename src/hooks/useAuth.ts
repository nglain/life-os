import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { setAuthToken } from '@/api/restClient';
import { connectSocket, disconnectSocket } from '@/api/socketClient';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setState(s => ({ ...s, loading: false, error: error.message }));
        return;
      }

      if (session) {
        setState({
          user: session.user,
          session,
          loading: false,
          error: null,
        });
        setAuthToken(session.access_token);

        // Connect socket with token
        connectSocket(session.access_token).catch(err => {
          console.error('Socket connection failed:', err);
        });
      } else {
        setState(s => ({ ...s, loading: false }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (session) {
          setState({
            user: session.user,
            session,
            loading: false,
            error: null,
          });
          setAuthToken(session.access_token);

          // Reconnect socket on token refresh
          if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
            try {
              await connectSocket(session.access_token);
            } catch (err) {
              console.error('Socket reconnection failed:', err);
            }
          }
        } else {
          setState({
            user: null,
            session: null,
            loading: false,
            error: null,
          });
          setAuthToken(null);
          disconnectSocket();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email
  const signIn = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }));

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setState(s => ({ ...s, loading: false, error: error.message }));
      return false;
    }

    return true;
  }, []);

  // Sign up with email
  const signUp = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }));

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setState(s => ({ ...s, loading: false, error: error.message }));
      return false;
    }

    return true;
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setState(s => ({ ...s, loading: true }));

    disconnectSocket();
    setAuthToken(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setState(s => ({ ...s, loading: false, error: error.message }));
      return false;
    }

    return true;
  }, []);

  // Get current token
  const getToken = useCallback(() => {
    return state.session?.access_token || null;
  }, [state.session]);

  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    signIn,
    signUp,
    signOut,
    getToken,
  };
}
