import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Sparkles, Check, CheckCheck } from 'lucide-react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { useAuth } from './context/AuthContext';
import Spinner from './components/auth/Spinner';

export default function PatientNotifications() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !db) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetched = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Seed initial sample notifications if none exist in Firestore for patient
      if (fetched.length === 0) {
        try {
          const sampleData = [
            {
              userId: currentUser.uid,
              type: 'schedule',
              title: 'Upcoming Appointment Reminder',
              body: 'Your Braces Adjustment is scheduled for tomorrow at 10:00 AM with Dr. Ana Santos.',
              time: '2 hours ago',
              unread: true,
              createdAt: new Date().toISOString(),
            },
            {
              userId: currentUser.uid,
              type: 'ai',
              title: 'AI Scan Result Released',
              body: 'Dr. Santos uploaded your latest diagnostic imaging. Check your summary notes.',
              time: 'Yesterday',
              unread: true,
              createdAt: new Date().toISOString(),
            },
            {
              userId: currentUser.uid,
              type: 'general',
              title: 'Welcome to SmileGuard AI',
              body: 'Your patient account has been verified and synced with Cloud Firestore.',
              time: '3 days ago',
              unread: false,
              createdAt: new Date().toISOString(),
            },
          ];

          for (const item of sampleData) {
            await addDoc(collection(db, 'notifications'), item);
          }
        } catch (e) {
          console.error('Error seeding notifications:', e);
        }
      } else {
        // Sort by unread first, then date
        fetched.sort((a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0));
        setNotifications(fetched);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error fetching notifications:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleMarkAsRead = async (id) => {
    try {
      if (db) {
        const notifRef = doc(db, 'notifications', id);
        await updateDoc(notifRef, { unread: false, read: true });
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      if (db) {
        const unreadItems = notifications.filter((n) => n.unread);
        for (const item of unreadItems) {
          const notifRef = doc(db, 'notifications', item.id);
          await updateDoc(notifRef, { unread: false, read: true });
        }
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-500 gap-3">
        <Spinner size="md" className="text-teal-600" />
        <span className="text-xs font-semibold">Loading real-time notifications...</span>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="mx-auto max-w-2xl space-y-4 text-left">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {notifications.map((item) => {
          let Icon = Bell;
          let color = 'text-slate-500';
          let bg = 'bg-slate-100';

          if (item.type === 'schedule') {
            Icon = Calendar;
            color = 'text-blue-600';
            bg = 'bg-blue-50';
          } else if (item.type === 'ai') {
            Icon = Sparkles;
            color = 'text-purple-600';
            bg = 'bg-purple-50';
          }

          return (
            <div
              key={item.id}
              onClick={() => item.unread && handleMarkAsRead(item.id)}
              className={`flex items-start gap-4 rounded-2xl border p-4 shadow-sm transition-all cursor-pointer ${
                item.unread
                  ? 'border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50/40'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className={`shrink-0 rounded-xl border border-slate-200/60 p-2.5 ${bg} ${color}`}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <span className="text-[10px] font-semibold text-slate-400">{item.time || 'Recent'}</span>
                </div>
                <p className="text-xs font-medium leading-relaxed text-slate-600">{item.body}</p>
              </div>

              {item.unread && (
                <div className="flex flex-col items-center gap-1">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">New</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
