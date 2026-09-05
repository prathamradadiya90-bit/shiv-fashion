import { useState, useEffect } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import api from '../../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchNotifications = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/notifications?page=${pageNumber}`);
      setNotifications(data.data || []);
      setPage(data.page || 1);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" />
          Notifications
        </h1>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={handleMarkAllAsRead}
            className="flex items-center text-sm font-medium text-primary hover:text-primary-dark transition-colors bg-primary/10 px-4 py-2 rounded-lg"
          >
            <Check className="w-4 h-4 mr-1.5" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications yet</h3>
            <p className="text-gray-500 text-sm">When you get notifications, they'll show up here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => { if (!notif.isRead) handleMarkAsRead(notif.id); }}
                className={`p-5 transition-colors cursor-pointer hover:bg-gray-50 ${
                  notif.isRead ? 'bg-white opacity-80' : 'bg-blue-50/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>}
                      <h4 className={`text-base font-semibold ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notif.title}
                      </h4>
                    </div>
                    <p className={`text-sm mb-2 ${notif.isRead ? 'text-gray-500' : 'text-gray-600 font-medium'}`}>
                      {notif.body}
                    </p>
                    <div className="flex items-center text-xs text-gray-400 font-medium">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-1 text-sm font-medium text-gray-700">
              Page {page} of {pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Notifications;
