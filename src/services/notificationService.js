import { db } from '../firebase';
import { collection, doc, updateDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';

export const subscribeUserNotifications = (userId, callback) => {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(list);
  });
};

export const markNotificationAsRead = async (notificationId) => {
  const docRef = doc(db, 'notifications', notificationId);
  return await updateDoc(docRef, { unread: false, readAt: serverTimestamp() });
};
