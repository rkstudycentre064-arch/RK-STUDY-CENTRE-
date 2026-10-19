import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  auth,
  onAuthStateChanged,
  fetchUserProfile,
  logoutUser,
  type FirebaseUser
} from '../lib/firebase';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isOwner: boolean;
  hasCustomClaim: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isOwner: false,
  hasCustomClaim: false,
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasCustomClaim, setHasCustomClaim] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (auth.currentUser) {
      const p = await fetchUserProfile(auth.currentUser.uid);
      setProfile(p);
      try {
        const tokenResult = await auth.currentUser.getIdTokenResult(true);
        setHasCustomClaim(tokenResult.claims.role === 'owner');
      } catch (err) {
        console.warn('[RK STUDY CENTRE] Error refreshing token claims:', err);
      }
    } else {
      setProfile(null);
      setHasCustomClaim(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Check for Custom Claims on the Firebase Auth Token
          const tokenResult = await currentUser.getIdTokenResult();
          const isClaimOwner = tokenResult.claims.role === 'owner';
          setHasCustomClaim(isClaimOwner);
        } catch (claimsErr) {
          console.warn('[RK STUDY CENTRE] Error inspecting custom claims:', claimsErr);
          setHasCustomClaim(false);
        }

        try {
          const p = await fetchUserProfile(currentUser.uid);
          setProfile(p);
        } catch (e) {
          console.warn('[RK STUDY CENTRE] Failed to fetch user profile:', e);
        }
      } else {
        setProfile(null);
        setHasCustomClaim(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
    setHasCustomClaim(false);
  };

  // Strictly enforce that students cannot make themselves Owner from the client.
  // Requires verified owner email or verified server-side Custom Claim.
  const isOwner = Boolean(
    user && (
      user.email === 'rkstudycentre064@gmail.com' ||
      hasCustomClaim
    )
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isOwner,
        hasCustomClaim,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
