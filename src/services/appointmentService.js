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

export const updateAppointmentStatus = async (appointmentId, status, appointmentData = null) => {
  const docRef = doc(db, 'appointments', appointmentId);
  await updateDoc(docRef, { status, updatedAt: serverTimestamp() });

  if (appointmentData?.userId) {
    const isAccepted = status === 'Confirmed' || status === 'Accepted';
    const title = isAccepted ? 'Appointment Confirmed! ✅' : `Appointment ${status}`;
    const body = isAccepted
      ? `Your appointment for ${appointmentData.service || 'dental service'} on ${appointmentData.date || ''} at ${appointmentData.time || ''} has been accepted by the clinic.`
      : `Your appointment request for ${appointmentData.service || 'dental service'} status was updated to: ${status}.`;

    await addDoc(collection(db, 'notifications'), {
      userId: appointmentData.userId,
      type: 'appointment',
      title: title,
      body: body,
      unread: true,
      createdAt: serverTimestamp(),
    });
  }
};
