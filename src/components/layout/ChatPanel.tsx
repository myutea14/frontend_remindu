import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import type { GroupMessage, Group } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedGroupId) {
      fetchMessages(selectedGroupId);
      
      // Polling setiap 2 detik agar pesan masuk secara real-time
      const interval = setInterval(() => {
        api.get(`/groups/${selectedGroupId}/messages`)
          .then(res => {
            setMessages(prev => {
              const newMessages = res.data;
              // Update state hanya jika ada pesan baru
              if (prev.length !== newMessages.length) return newMessages;
              if (prev.length > 0 && prev[prev.length - 1].id !== newMessages[newMessages.length - 1].id) return newMessages;
              return prev;
            });
          })
          .catch(console.error);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [selectedGroupId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
      if (res.data.length > 0 && !selectedGroupId) {
        setSelectedGroupId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (groupId: number) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/groups/${groupId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroupId) return;

    try {
      const res = await api.post(`/groups/${selectedGroupId}/messages`, {
        message: newMessage,
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-[380px] bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.05)] z-50 flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="h-16 border-b border-border-custom flex items-center justify-between px-6 bg-[#fcf1f2]/30">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[24px]">chat</span>
            <h2 className="text-[18px] font-bold text-on-surface">Diskusi Komunitas</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface rounded-full transition-colors text-outline">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Group Selector */}
        {groups.length > 0 ? (
          <div className="p-4 border-b border-border-custom">
            <label className="text-xs font-bold text-outline uppercase tracking-wider mb-2 block">Pilih Grup</label>
            <select
              value={selectedGroupId || ''}
              onChange={(e) => setSelectedGroupId(Number(e.target.value))}
              className="w-full px-3 py-2 bg-surface border border-border-custom rounded-lg text-sm font-semibold outline-none focus:border-primary"
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="p-6 text-center text-on-surface-variant text-sm">
            Anda belum bergabung ke grup manapun.
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#fafafa]">
          {isLoading ? (
            <div className="flex justify-center mt-10"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : messages.length === 0 && selectedGroupId ? (
            <div className="text-center text-on-surface-variant text-sm mt-10 bg-white p-4 rounded-xl shadow-sm border border-border-custom">
              Belum ada pesan di grup ini. Mulai diskusi!
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map(msg => {
                const isMe = msg.user_id === user?.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-primary flex items-center justify-center text-white text-[12px] font-bold uppercase shadow-sm">
                        {msg.user?.avatar_url ? (
                          <img src={msg.user.avatar_url} alt={msg.user?.name} className="w-full h-full object-cover" />
                        ) : (
                          msg.user?.name?.charAt(0) || 'U'
                        )}
                      </div>
                      
                      {/* Message Content */}
                      <div className="flex flex-col">
                        <span className={`text-[11px] text-on-surface-variant font-medium mb-1 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                          {isMe ? 'Anda' : msg.user?.name} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className={`px-4 py-2 rounded-2xl text-[14px] ${
                          isMe 
                            ? 'bg-primary text-white rounded-br-sm' 
                            : 'bg-white border border-border-custom text-on-surface rounded-bl-sm'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        {groups.length > 0 && (
          <div className="p-4 bg-white border-t border-border-custom">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 px-4 py-2.5 bg-surface border border-border-custom rounded-full text-sm outline-none focus:border-primary transition-colors"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px] ml-1">send</span>
              </button>
            </form>
          </div>
        )}
        
      </div>
    </>
  );
};

export default ChatPanel;
