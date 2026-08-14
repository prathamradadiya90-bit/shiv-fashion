import React, { useState, useEffect } from 'react';
import { Mail, Check, Inbox, Trash2, Search, ExternalLink, MessageSquare, Clock } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, READ
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/contact');
      setMessages(data);
    } catch {
      toast.error('Failed to load customer messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/contact/${id}/read`);
      setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m));
      toast.success('Message marked as read');
    } catch {
      toast.error('Failed to update message status');
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this inquiry?')) return;
    try {
      await api.delete(`/contact/${id}`);
      setMessages(messages.filter(m => m.id !== id));
      toast.success('Message deleted');
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(m => {
    const matchesFilter = filter === 'ALL' || (filter === 'UNREAD' ? !m.isRead : m.isRead);
    const matchesSearch = !search || 
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.subject?.toLowerCase().includes(search.toLowerCase()) ||
      m.message?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-heading">Customer Inquiries</h2>
          <p className="text-xs text-slate-500">Contact form submissions and support requests</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            {unreadCount} Unread Message{unreadCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-full md:w-auto">
          {[
            { label: 'All Inquiries', value: 'ALL', count: messages.length },
            { label: 'Unread', value: 'UNREAD', count: unreadCount },
            { label: 'Read', value: 'READ', count: messages.length - unreadCount },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                filter === tab.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filter === tab.value ? 'bg-slate-100 text-slate-800' : 'bg-slate-200/60 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by sender, email or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-[#800020] outline-none"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">Loading inquiries...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <Inbox size={44} className="mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-semibold text-slate-600">No messages found</p>
            <p className="text-xs text-slate-400">Customer contact inquiries will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMessages.map((message) => (
              <div 
                key={message.id} 
                className={`p-6 transition-colors ${message.isRead ? 'bg-white hover:bg-slate-50/50' : 'bg-amber-50/20 hover:bg-amber-50/40'}`}
              >
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                      message.isRead 
                        ? 'bg-slate-100 text-slate-500 border border-slate-200' 
                        : 'bg-[#800020] text-[#E5C158] shadow-[#800020]/20'
                    }`}>
                      <MessageSquare size={18} />
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{message.name}</h3>
                        <a 
                          href={`mailto:${message.email}`} 
                          className="text-xs text-slate-500 hover:text-[#800020] font-mono flex items-center gap-1 group"
                        >
                          <span>&lt;{message.email}&gt;</span>
                          <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        {!message.isRead && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white rounded-full">
                            New
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                        <Clock size={11} />
                        {new Date(message.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>

                      <div className="pt-2">
                        {message.subject && (
                          <h4 className="text-xs font-bold text-slate-800 mb-1">
                            Subject: <span className="font-normal text-slate-600">{message.subject}</span>
                          </h4>
                        )}
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-start">
                    {!message.isRead && (
                      <button 
                        onClick={() => markAsRead(message.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                        title="Mark as Read"
                      >
                        <Check size={13} className="text-emerald-600" />
                        <span>Mark Read</span>
                      </button>
                    )}
                    <a
                      href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject || 'Your Inquiry to Shreeji Fashion')}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#800020] hover:bg-[#600018] text-white transition-colors shadow-sm"
                    >
                      <Mail size={13} />
                      <span>Reply</span>
                    </a>
                    <button 
                      onClick={() => deleteMessage(message.id)}
                      className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                      title="Delete Inquiry"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
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
