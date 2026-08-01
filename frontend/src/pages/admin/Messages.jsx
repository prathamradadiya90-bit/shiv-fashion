import React, { useState, useEffect } from 'react';
import { Mail, Check, Inbox } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await api.get('/contact');
        setMessages(data);
      } catch (error) {
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/contact/${id}/read`);
      setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m));
      toast.success('Message marked as read');
    } catch (error) {
      toast.error('Failed to mark message as read');
    }
  };

  if (loading) return <div>Loading messages...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Customer Messages</h1>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium">
          {messages.filter(m => !m.isRead).length} Unread
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Inbox size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No messages received yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`p-6 transition-colors ${message.isRead ? 'bg-white' : 'bg-blue-50/50'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${message.isRead ? 'bg-gray-100 text-gray-500' : 'bg-primary/10 text-primary'}`}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-gray-900">{message.name}</h3>
                        <span className="text-sm text-gray-500">&lt;{message.email}&gt;</span>
                        {!message.isRead && (
                          <span className="px-2 py-0.5 text-xs bg-primary text-white rounded-full">New</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                      
                      <div className="mt-3">
                        {message.subject && (
                          <h4 className="font-semibold text-gray-800 mb-1">Subject: {message.subject}</h4>
                        )}
                        <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                      </div>
                    </div>
                  </div>
                  
                  {!message.isRead && (
                    <button 
                      onClick={() => markAsRead(message.id)}
                      className="flex items-center text-sm text-gray-500 hover:text-primary transition-colors border border-gray-200 px-3 py-1.5 rounded bg-white"
                    >
                      <Check size={16} className="mr-1" /> Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
