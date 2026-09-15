import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Sparkles, Check, CheckCheck } from 'lucide-react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './context/AuthContext';
import Spinner from './components/auth/Spinner';
import MascotLoader from './components/common/MascotLoader';

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

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setNotifications(items);
        setLoading(false);
      },
      (err) => {
        console.warn('Notifications snapshot error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleMarkAsRead = async (id) => {
    try {
      if (db) {
        const notifRef = doc(db, 'notifications', id);
        await updateDoc(notifRef, { unread: false, read: true });
      }
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
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
    return <MascotLoader message="Loading notifications..." fullScreen={false} size="md" />;
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
        {notifications.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
            <Bell className="h-8 w-8 text-purple-400 mx-auto opacity-50" />
            <p className="text-sm font-bold text-slate-800">No Notifications Yet</p>
            <p className="text-xs text-slate-500">
              Alerts regarding appointment confirmations, AI scan reports, and clinic notices will appear here.
            </p>
          </div>
        ) : (
          notifications.map((item) => {
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
          })
        )}
      </div>
    </div>
  );
}
