import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Bell } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!userInfo?.token) return;
    try {
      const [notifsRes, unreadRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count'),
      ]);
      setNotifications(notifsRes.data?.data || []);
      setUnreadCount(unreadRes.data?.count || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err?.response?.data?.message || err.message);
    }
  }, [userInfo?.token]);

  useEffect(() => {
    let socket;
    let pollInterval;

    if (userInfo?.token) {
      // 1. Initial fetch
      fetchNotifications();

      // 2. Setup Socket.IO for persistent/local environments
      const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
      const SOCKET_URL = BASE_URL.replace(/\/api$/, '');

      // Only attempt Socket.io if not on pure Vercel serverless domain
      if (!SOCKET_URL.includes('vercel.app')) {
        try {
          socket = io(SOCKET_URL, {
            withCredentials: true,
            auth: { token: userInfo.token },
            reconnectionAttempts: 5,
            timeout: 10000,
          });

          socket.on('new_notification', (notification) => {
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
          });

          socket.on('connect_error', () => {
            // Socket failed; fallback polling will seamlessly maintain real-time updates
          });
        } catch {
          // Ignore socket init errors on restricted environments
        }
      }

      // 3. Fallback polling for serverless (e.g. Vercel) & background sync (every 30s)
      pollInterval = setInterval(() => {
        fetchNotifications();
      }, 30000);

      // 4. Refetch immediately when user switches tabs back to the app
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          fetchNotifications();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        if (socket) socket.disconnect();
        if (pollInterval) clearInterval(pollInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [userInfo, fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  if (!userInfo) {
    return null;
  }

  return (
    <div className="relative" ref={notificationRef}>
      <button 
        onClick={() => setNotificationOpen(!notificationOpen)}
        className="flex items-center space-x-1 text-gray-800 hover:text-primary transition-colors font-medium relative p-1.5 rounded-full hover:bg-gray-100"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute 0 top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {notificationOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl py-1 border border-gray-100 z-50 max-h-[30rem] flex flex-col animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <p className="text-sm font-bold text-gray-900">Notifications</p>
            {unreadCount > 0 && (
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-semibold">
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1 max-h-80 divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-sm text-gray-500 text-center flex flex-col items-center">
                <Bell className="w-8 h-8 text-gray-300 mb-2" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  onClick={() => {
                    if (!notif.isRead) handleMarkAsRead(notif.id);
                  }}
                  className={`px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-gray-50 ${
                    notif.isRead ? 'bg-white text-gray-600' : 'bg-primary/5 text-gray-900 font-medium'
                  }`}
                >
                  <p className="text-sm font-semibold mb-0.5 leading-snug">{notif.title}</p>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{notif.body}</p>
                  <p className="text-gray-400 text-[10px] mt-1.5 font-normal">
                    {new Date(notif.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
          
          <div 
            className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/80 text-center shrink-0 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => {
              setNotificationOpen(false);
              navigate('/notifications');
            }}
          >
            <span className="text-xs text-primary font-bold">
              View all notifications
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
