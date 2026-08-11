import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

export const bookNewAppointment = async (appointmentData) => {
  const docRef = await addDoc(collection(db, 'appointments'), {
    ...appointmentData,
    status: 'Pending',
    createdAt: serverTimestamp(),
  });

  // Also create patient notification
  await addDoc(collection(db, 'notifications'), {
    userId: appointmentData.userId,
    type: 'appointment',
    title: 'Appointment Request Submitted',
    body: `Your appointment request for ${appointmentData.service} on ${appointmentData.date} at ${appointmentData.time} is pending dentist confirmation.`,
    unread: true,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

export const subscribeUserAppointments = (userId, callback) => {
  const q = query(collection(db, 'appointments'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(list);
  });
};

export const subscribeAllAppointments = (callback) => {
  const q = query(collection(db, 'appointments'));
  return onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(list);
  });
};

export const updateAppointmentStatus = async (appointmentId, status) => {
  const docRef = doc(db, 'appointments', appointmentId);
  return await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
};
