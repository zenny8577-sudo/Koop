import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/integrations/supabase/client';

const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string, currentStatus: string) => {
    if (currentStatus !== 'new') return;
    try {
      await supabase.from('contact_messages').update({ status: 'read' }).eq('id', id);
      setMessages(messages.map(m => m.id === id ? { ...m, status: 'read' } : m));
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Laden...</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">Inkomende Berichten</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{messages.length} Berichten</span>
        </div>
        
        {messages.length === 0 ? (
          <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest">
            Geen berichten gevonden
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`p-8 hover:bg-slate-50 transition-colors cursor-pointer ${msg.status === 'new' ? 'bg-blue-50/30' : ''}`}
                onClick={() => markAsRead(msg.id, msg.status)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${msg.status === 'new' ? 'bg-[#FF4F00]' : 'bg-slate-200'}`} />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{msg.name}</h4>
                      <p className="text-xs text-slate-500">{msg.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-7">{msg.message}</p>
                {msg.status === 'new' && (
                  <div className="pl-7 mt-4">
                    <span className="text-[9px] font-black text-[#FF4F00] uppercase tracking-widest">Nieuw</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;