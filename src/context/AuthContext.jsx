import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext({
  currentUser: null,
  userProfile: null,
  loading: true,
  onboardingCompleted: false,
  isAdmin: false,
  logout: async () => {},
  refreshProfile: async () => {},
  updateUserProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    let unsubscribeDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (user) {
        setCurrentUser(user);

        // Load local cache if available as immediate fallback
        const cached = localStorage.getItem(`smileguard_profile_${user.uid}`);
        if (cached) {
          try {
            setUserProfile(JSON.parse(cached));
          } catch (e) {
            console.warn("Failed to parse cached profile", e);
          }
        }

        // Listen to Firestore user profile in real-time
        if (db) {
          const userRef = doc(db, 'users', user.uid);
          unsubscribeDoc = onSnapshot(
            userRef,
            (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                setUserProfile(data);
                localStorage.setItem(`smileguard_profile_${user.uid}`, JSON.stringify(data));
              }
              setLoading(false);
            },
            (err) => {
              console.warn("Firestore user snapshot permission/network issue:", err.message);
              setLoading(false);
            }
          );
        } else {
          setLoading(false);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setCurrentUser(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      if (db) {
        try {
          const snap = await getDoc(doc(db, 'users', currentUser.uid));
          if (snap.exists()) {
            const data = snap.data();
            setUserProfile(data);
            localStorage.setItem(`smileguard_profile_${currentUser.uid}`, JSON.stringify(data));
            return;
          }
        } catch (err) {
          console.warn("Refresh profile read error:", err.message);
        }
      }
      const cached = localStorage.getItem(`smileguard_profile_${currentUser.uid}`);
      if (cached) {
        try {
          setUserProfile(JSON.parse(cached));
        } catch (e) {}
      }
    }
  };

  const updateUserProfile = async (newProfileData) => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    const merged = {
      ...userProfile,
      ...newProfileData,
      uid: uid,
      email: currentUser.email || userProfile?.email || '',
      onboardingCompleted: true,
    };

    setUserProfile(merged);
    localStorage.setItem(`smileguard_profile_${uid}`, JSON.stringify(merged));

    if (db) {
      try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, merged, { merge: true });
      } catch (err) {
        console.warn("Firestore setDoc permission notice:", err.message);
      }
    }
  };

  // Determine if profile onboarding is complete
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'dentist';
  const onboardingCompleted = isAdmin || Boolean(
    userProfile && 
    userProfile.onboardingCompleted && 
    userProfile.phone && 
    userProfile.birthDate
  );

  const value = {
    currentUser,
    userProfile,
    loading,
    onboardingCompleted,
    isAdmin,
    logout,
    refreshProfile,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
