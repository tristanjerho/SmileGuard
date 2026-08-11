import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
} from 'firebase/firestore';

export const createLabRecord = async (labData) => {
  return await addDoc(collection(db, 'laboratoryRecords'), {
    ...labData,
    status: labData.status || 'Pending',
    createdAt: serverTimestamp(),
  });
};

export const subscribeAllLabRecords = (callback) => {
  const q = query(collection(db, 'laboratoryRecords'));
  return onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(list);
  });
};

export const updateLabRecordStatus = async (recordId, status, notes = '') => {
  const docRef = doc(db, 'laboratoryRecords', recordId);
  return await updateDoc(docRef, { status, notes, updatedAt: serverTimestamp() });
};
