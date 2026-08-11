import { db } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Syncs user and patient profile records with Cloud Firestore.
 * Matches exact schema from Firestore console:
 * - users collection: FirstName, lastName, email, profilePicture, role, createdAt
 * - patients collection: fullName, email, phone, gender, birthDate, address, allergies, medicalHistory, createdAt
 */
export async function syncUserWithFirestore(user, fullNameInput = '', defaultRole = 'patient') {
  if (!user || !db) return;

  const uid = user.uid;
  const email = user.email || '';
  const displayName = fullNameInput || user.displayName || '';

  // Split name into FirstName and lastName
  const nameParts = displayName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  try {
    // 1. Sync `users` collection document
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      await setDoc(
        userDocRef,
        {
          FirstName: firstName,
          lastName: lastName,
          email: email,
          profilePicture: user.photoURL || '',
          role: defaultRole,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    } else {
      // Update missing fields if empty while preserving existing role
      const existingData = userSnap.data();
      const currentRole = existingData.role;
      // If existing role is admin/dentist, keep it; otherwise use existing or defaultRole if defaultRole is admin
      const resolvedRole = (currentRole === 'admin' || currentRole === 'dentist')
        ? currentRole
        : (defaultRole === 'admin' || defaultRole === 'dentist' ? defaultRole : (currentRole || defaultRole));

      await setDoc(
        userDocRef,
        {
          FirstName: existingData.FirstName || firstName,
          lastName: existingData.lastName || lastName,
          email: email,
          profilePicture: existingData.profilePicture || user.photoURL || '',
          role: resolvedRole,
        },
        { merge: true }
      );
    }

    // 2. Sync `patients` collection document
    const patientDocRef = doc(db, 'patients', uid);
    const patientSnap = await getDoc(patientDocRef);

    if (!patientSnap.exists()) {
      await setDoc(
        patientDocRef,
        {
          fullName: displayName || email,
          email: email,
          phone: '',
          gender: '',
          birthDate: serverTimestamp(),
          address: '',
          allergies: '',
          medicalHistory: '',
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    } else {
      const existingPatient = patientSnap.data();
      await setDoc(
        patientDocRef,
        {
          fullName: existingPatient.fullName || displayName || email,
          email: email,
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.error('Error syncing user with Cloud Firestore:', err);
  }
}
