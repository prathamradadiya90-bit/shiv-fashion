import React, { useState, useEffect, useRef } from 'react';
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let socket;

    if (userInfo) {
      // 1. Fetch existing notifications
      const fetchNotifications = async () => {
        try {
          const { data } = await api.get('/notifications');
          setNotifications(data.data || []);
          const unreadRes = await api.get('/notifications/unread-count');
          setUnreadCount(unreadRes.data.count || 0);
        } catch (err) {
          console.error(err);
        }
      };
      fetchNotifications();

      // 2. Setup Socket.IO for real-time notifications
      const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
      // Remove '/api' from BASE_URL if it exists since socket connects to the root domain
      const SOCKET_URL = BASE_URL.replace(/\/api$/, '');

      // Disable Socket.io if the backend is on Vercel, as Vercel serverless doesn't support WebSockets
      if (!SOCKET_URL.includes('vercel.app')) {
        socket = io(SOCKET_URL, {
          withCredentials: true,
          auth: { token: userInfo.token }
        });
      }

      if (socket) {
        socket.on('new_notification', (notification) => {
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        });
      }
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userInfo]);

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
        className="flex items-center space-x-1 text-gray-800 hover:text-primary transition-colors font-medium relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>
      
      {notificationOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50 max-h-[28rem] flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <p className="text-sm font-bold text-gray-900">Notifications</p>
            {unreadCount > 0 && (
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1 max-h-80">
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
                  className={`px-4 py-3 border-b border-gray-50 text-sm cursor-pointer transition-colors hover:bg-gray-50 ${notif.isRead ? 'bg-white opacity-70' : 'bg-blue-50/40 font-medium'}`}
                >
                  <p className="text-gray-900 mb-1 leading-snug">{notif.title}</p>
                  <p className="text-gray-600 text-xs line-clamp-2">{notif.body}</p>
                  <p className="text-gray-400 text-[10px] mt-1.5 font-medium">{new Date(notif.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
          
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center shrink-0 cursor-pointer hover:bg-gray-100" onClick={() => { setNotificationOpen(false); navigate('/notifications'); }}>
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
