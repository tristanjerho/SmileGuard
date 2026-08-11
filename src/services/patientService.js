import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

export const savePatientProfile = async (uid, profileData) => {
  const userDocRef = doc(db, 'users', uid);
  const patientDocRef = doc(db, 'patients', uid);

  const payload = {
    ...profileData,
    uid,
    onboardingCompleted: true,
    updatedAt: serverTimestamp(),
  };

  await setDoc(userDocRef, payload, { merge: true });
  await setDoc(patientDocRef, payload, { merge: true });

  return payload;
};

export const getPatientProfile = async (uid) => {
  const userDocRef = doc(db, 'users', uid);
  const snap = await getDoc(userDocRef);
  return snap.exists() ? snap.data() : null;
};

export const subscribeAllPatients = (callback) => {
  const q = query(collection(db, 'users'));
  return onSnapshot(q, (snapshot) => {
    const patients = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.role !== 'admin' && data.role !== 'dentist') {
        patients.push({ id: docSnap.id, ...data });
      }
    });
    callback(patients);
  });
};
