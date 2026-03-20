import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { translateAuthError } from "@/lib/auth-errors";

interface Profile {
  id: string;
  user_id: string;
  salon_id: string;
  full_name: string;
  avatar_url: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  userRole: "admin" | "employee" | null;
  salonId: string | null;
  professionalId: string | null;
  loading: boolean;
  subscribed: boolean;
  subscriptionLoading: boolean;
  subscriptionEnd: string | null;
  onTrial: boolean;
  trialDaysLeft: number;
  signUp: (email: string, password: string, fullName: string, salonName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "employee" | null>(null);
  const [salonId, setSalonId] = useState<string | null>(null);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  const TRIAL_DAYS = 5;

  const getTrialInfo = useCallback(() => {
    if (!user?.created_at) return { onTrial: false, trialDaysLeft: 0 };
    const createdAt = new Date(user.created_at);
    const trialEnd = new Date(createdAt.getTime() + TRIAL_DAYS * 86400000);
    const now = new Date();
    if (now < trialEnd) {
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / 86400000);
      return { onTrial: true, trialDaysLeft: daysLeft };
    }
    return { onTrial: false, trialDaysLeft: 0 };
  }, [user]);

  const { onTrial, trialDaysLeft } = getTrialInfo();

  const fetchProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData as Profile);
      setSalonId(profileData.salon_id);

      const { data: proData } = await supabase
        .from("professionals")
        .select("id")
        .eq("profile_id", profileData.id)
        .maybeSingle();
      setProfessionalId(proData?.id || null);
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (roleData) {
      setUserRole(roleData.role as "admin" | "employee");
    }
  };

  const checkSubscription = useCallback(async (force = false) => {
    // If we already know the subscription is active and hasn't expired, skip the API call
    if (!force && subscribed && subscriptionEnd) {
      const endDate = new Date(subscriptionEnd);
      if (endDate > new Date()) {
        return; // Still within the paid period, no need to re-check
      }
    }

    try {
      setSubscriptionLoading(true);
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) {
        console.error("Error checking subscription:", error);
        setSubscribed(false);
        return;
      }
      // If token expired, try to refresh session and retry once
      if (data?.token_expired) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError) {
          const { data: retryData } = await supabase.functions.invoke("check-subscription");
          setSubscribed(retryData?.subscribed ?? false);
          setSubscriptionEnd(retryData?.subscription_end ?? null);
          return;
        }
      }
      setSubscribed(data?.subscribed ?? false);
      setSubscriptionEnd(data?.subscription_end ?? null);
    } catch (err) {
      console.error("Error checking subscription:", err);
      setSubscribed(false);
    } finally {
      setSubscriptionLoading(false);
    }
  }, [subscribed, subscriptionEnd]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
          setUserRole(null);
          setSalonId(null);
          setProfessionalId(null);
          setSubscribed(false);
          setSubscriptionEnd(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check subscription when user is available
  useEffect(() => {
    if (user) {
      checkSubscription();
      // Re-check once per day (subscription is validated by end date)
      const interval = setInterval(() => checkSubscription(), 86400000);
      return () => clearInterval(interval);
    } else {
      setSubscriptionLoading(false);
    }
  }, [user, checkSubscription]);

  const signUp = async (email: string, password: string, fullName: string, salonName: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName, salon_name: salonName },
      },
    });

    if (authError) throw new Error(translateAuthError(authError.message));
    if (!authData.user) throw new Error("Falha ao criar conta");
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(translateAuthError(error.message));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUserRole(null);
    setSalonId(null);
    setProfessionalId(null);
    setSubscribed(false);
    setSubscriptionEnd(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session, user, profile, userRole, salonId, professionalId, loading,
        subscribed, subscriptionLoading, subscriptionEnd,
        onTrial, trialDaysLeft,
        signUp, signIn, signOut, checkSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
