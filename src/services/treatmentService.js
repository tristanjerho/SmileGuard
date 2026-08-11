import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

export const createTreatmentRecord = async (treatmentData) => {
  return await addDoc(collection(db, 'treatments'), {
    ...treatmentData,
    createdAt: serverTimestamp(),
  });
};

export const subscribePatientTreatments = (userId, callback) => {
  const q = query(collection(db, 'treatments'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(list);
  });
};

export const subscribeAllTreatments = (callback) => {
  const q = query(collection(db, 'treatments'));
  return onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(list);
  });
};
