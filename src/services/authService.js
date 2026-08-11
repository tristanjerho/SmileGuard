import { auth, googleProvider, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const loginWithEmail = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email, password, defaultRole = 'patient') => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create initial user document in Firestore
  const userDocRef = doc(db, 'users', user.uid);
  await setDoc(
    userDocRef,
    {
      uid: user.uid,
      email: user.email,
      role: defaultRole,
      onboardingCompleted: defaultRole === 'admin' || defaultRole === 'dentist',
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return userCredential;
};

export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

export const logoutUser = async () => {
  return await signOut(auth);
};

export const resetUserPassword = async (email) => {
  return await sendPasswordResetEmail(auth, email);
};

export const getUserRoleAndProfile = async (uid) => {
  const userDocRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userDocRef);
  if (userSnap.exists()) {
    return userSnap.data();
  }
  return null;
};
