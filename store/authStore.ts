import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    isInitialized: boolean;
    pendingEmail: string | null; // Email awaiting OTP verification

    initialize: () => Promise<void>;
    signUp: (email: string, password: string) => Promise<{ error: string | null; needsVerification: boolean }>;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
    resendOtp: (email: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    setSession: (session: Session | null) => void;
    setPendingEmail: (email: string | null) => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
    session: null,
    user: null,
    isLoading: false,
    isInitialized: false,
    pendingEmail: null,

    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            set({
                session,
                user: session?.user ?? null,
                isInitialized: true,
            });

            // Listen for auth state changes
            supabase.auth.onAuthStateChange((_event, session) => {
                set({
                    session,
                    user: session?.user ?? null,
                });
            });
        } catch {
            set({ isInitialized: true });
        }
    },

    signUp: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                set({ isLoading: false });
                return { error: error.message, needsVerification: false };
            }

            // If the user's email is not confirmed, they need OTP verification.
            // Supabase returns a user but no active session when email confirmation is required.
            const needsVerification = !data.session && !!data.user;

            if (needsVerification) {
                set({
                    pendingEmail: email,
                    isLoading: false,
                });
            } else {
                set({
                    session: data.session,
                    user: data.user,
                    isLoading: false,
                });
            }

            return { error: null, needsVerification };
        } catch (err: any) {
            set({ isLoading: false });
            return { error: err?.message ?? 'An unexpected error occurred', needsVerification: false };
        }
    },

    signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                set({ isLoading: false });
                return { error: error.message };
            }

            set({
                session: data.session,
                user: data.user,
                isLoading: false,
                pendingEmail: null,
            });
            return { error: null };
        } catch (err: any) {
            set({ isLoading: false });
            return { error: err?.message ?? 'An unexpected error occurred' };
        }
    },

    verifyOtp: async (email: string, token: string) => {
        set({ isLoading: true });
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'signup',
            });

            if (error) {
                set({ isLoading: false });
                return { error: error.message };
            }

            set({
                session: data.session,
                user: data.user,
                isLoading: false,
                pendingEmail: null,
            });
            return { error: null };
        } catch (err: any) {
            set({ isLoading: false });
            return { error: err?.message ?? 'An unexpected error occurred' };
        }
    },

    resendOtp: async (email: string) => {
        set({ isLoading: true });
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
            });

            set({ isLoading: false });

            if (error) {
                return { error: error.message };
            }

            return { error: null };
        } catch (err: any) {
            set({ isLoading: false });
            return { error: err?.message ?? 'An unexpected error occurred' };
        }
    },

    signOut: async () => {
        set({ isLoading: true });
        await supabase.auth.signOut();
        set({
            session: null,
            user: null,
            isLoading: false,
            pendingEmail: null,
        });
    },

    setSession: (session) => {
        set({
            session,
            user: session?.user ?? null,
        });
    },

    setPendingEmail: (email) => {
        set({ pendingEmail: email });
    },
}));
