import { useState, useEffect } from 'react';
import { 
  Mail, 
  Check, 
  Inbox, 
  Trash2, 
  Search, 
  ExternalLink, 
  MessageSquare, 
  Clock, 
  RefreshCw 
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import AdminHeader from '../../components/admin/AdminHeader';
import ConfirmModal from '../../components/admin/ConfirmModal';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, READ
  const [search, setSearch] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/contact');
      const list = Array.isArray(data) ? data : (data?.messages || []);
      setMessages(list);
    } catch {
      toast.error('Failed to load customer messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/contact/${id}/read`);
      setMessages((prev) => (Array.isArray(prev) ? prev.map(m => m.id === id ? { ...m, isRead: true } : m) : []));
      toast.success('Message marked as read');
    } catch {
      toast.error('Failed to update message status');
    }
  };

  const confirmDeleteMessage = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/contact/${deleteTarget.id}`);
      setMessages((prev) => (Array.isArray(prev) ? prev.filter(m => m.id !== deleteTarget.id) : []));
      toast.success('Inquiry deleted successfully');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete message');
    } finally {
      setDeleting(false);
    }
  };

  const msgList = Array.isArray(messages) ? messages : [];
  const filteredMessages = msgList.filter(m => {
    const matchesFilter = filter === 'ALL' || (filter === 'UNREAD' ? !m.isRead : m.isRead);
    const matchesSearch = !search || 
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.subject?.toLowerCase().includes(search.toLowerCase()) ||
      m.message?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = msgList.filter(m => !m.isRead).length;

  return (
    <div className="space-y-6">
      {/* Unified Header */}
      <AdminHeader
        title="Customer Support Inquiries"
        subtitle="Review contact form submissions, bridal customization inquiries, and sizing assistance requests"
        badge={`${unreadCount} Unread`}
        breadcrumbs={['Support', 'Inquiries']}
        action={
          <button
            onClick={fetchMessages}
            className="p-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-xs transition-colors"
            title="Refresh Inquiries"
          >
            <RefreshCw size={15} />
          </button>
        }
      />

      {/* Filter Tabs & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl w-full md:w-auto">
          {[
            { label: 'All Inquiries', value: 'ALL', count: messages.length },
            { label: 'Unread', value: 'UNREAD', count: unreadCount },
            { label: 'Read', value: 'READ', count: messages.length - unreadCount },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                filter === tab.value
                  ? 'bg-white text-black shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filter === tab.value ? 'bg-neutral-100 text-black' : 'bg-neutral-200/60 text-neutral-600'
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
            placeholder="Search by sender, email or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
        </div>
      </div>

      {/* Messages List Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-neutral-200/80 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-neutral-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-black" />
            <span className="text-xs font-semibold">Loading inquiries...</span>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-16 text-center text-neutral-500 space-y-3">
            <Inbox size={40} className="mx-auto text-neutral-300 stroke-1" />
            <p className="text-sm font-bold text-neutral-800">No inquiries found</p>
            <p className="text-xs text-neutral-400">Customer contact inquiries will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredMessages.map((message) => (
              <div 
                key={message.id} 
                className={`p-6 transition-colors ${message.isRead ? 'bg-white hover:bg-neutral-50/50' : 'bg-neutral-50/80 hover:bg-neutral-50'}`}
              >
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                      message.isRead 
                        ? 'bg-neutral-100 text-neutral-500 border border-neutral-200' 
                        : 'bg-black text-white shadow-xs'
                    }`}>
                      <MessageSquare size={17} />
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-neutral-900 text-sm">{message.name}</h3>
                        <a 
                          href={`mailto:${message.email}`} 
                          className="text-xs text-neutral-500 hover:text-black font-mono flex items-center gap-1 group"
                        >
                          <span>&lt;{message.email}&gt;</span>
                          <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        {!message.isRead && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-black text-white rounded-full">
                            New
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-neutral-900 font-heading">{message.subject}</p>
                      <p className="text-xs text-neutral-700 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-200/60">
                        {message.message}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-neutral-400">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={11} />
                          {new Date(message.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-start">
                    {!message.isRead && (
                      <button 
                        onClick={() => markAsRead(message.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors border border-neutral-200"
                        title="Mark as Read"
                      >
                        <Check size={13} className="text-emerald-600" />
                        <span>Mark Read</span>
                      </button>
                    )}
                    <a
                      href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject || 'Your Inquiry to chaniyacholi.nook')}`}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white transition-colors shadow-xs"
                    >
                      <Mail size={13} />
                      <span>Reply</span>
                    </a>
                    <button 
                      onClick={() => setDeleteTarget({ id: message.id, name: message.name })}
                      className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteMessage}
        isLoading={deleting}
        title="Delete Customer Message?"
        message={`Are you sure you want to delete inquiry from "${deleteTarget?.name}"?`}
        confirmText="Yes, Delete Message"
        variant="danger"
      />
    </div>
  );
};

export default Messages;
