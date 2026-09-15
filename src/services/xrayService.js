import { db, storage } from '../firebase';
import { collection, addDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { uploadToCloudinary } from './cloudinaryService';

export const uploadXrayImage = async (file, patientId) => {
  try {
    const res = await uploadToCloudinary(file, `dental_xrays/${patientId || 'general'}`);
    return res.url;
  } catch (cloudinaryErr) {
    console.warn('Cloudinary upload fallback to Firebase Storage:', cloudinaryErr);
    if (!storage) {
      return URL.createObjectURL(file);
    }
    const storageRef = ref(storage, `dentalXrays/${patientId || 'general'}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }
};


export const saveDentalXrayRecord = async (xrayData) => {
  return await addDoc(collection(db, 'dentalXrays'), {
    ...xrayData,
    imageType: 'Dental X-ray',
    analysisStatus: 'Analyzed',
    createdAt: serverTimestamp(),
  });
};

export const subscribePatientXrays = (patientId, callback) => {
  const q = query(collection(db, 'dentalXrays'), where('patientId', '==', patientId));
  return onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(list);
  });
};
