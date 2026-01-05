import React, { useState } from 'react';
import { supabase } from '../../src/integrations/supabase/client';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, user }) => {
  const [formData, setFormData] = useState({
    name: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      // 1. Save to Database (Reliable storage)
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          message: formData.message,
          user_id: user?.id
        }]);

      if (dbError) throw dbError;

      // 2. Trigger Email Notification (Best effort)
      await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      alert('Bedankt! Uw bericht is verzonden. Een curator neemt spoedig contact op.');
      onClose();
      setFormData({ name: '', email: '', message: '' });

    } catch (err) {
      console.error('Contact error:', err);
      alert('Er is iets misgegaan. Probeer het later opnieuw.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-fadeIn">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-white w-full max-w-lg p-10 rounded-[40px] shadow-2xl space-y-8">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4F00]">Support</span>
          <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">Stel uw vraag.</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3">Naam</label>
            <input 
              required
              placeholder="Uw Naam" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FF4F00]/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3">E-mailadres</label>
            <input 
              type="email"
              required
              placeholder="email@voorbeeld.nl" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FF4F00]/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3">Bericht</label>
            <textarea 
              required
              placeholder="Waar kunnen we u mee helpen?" 
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-[#FF4F00]/20 h-32"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-4 bg-slate-50 text-slate-400 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-colors"
          >
            Annuleren
          </button>
          <button 
            type="submit"
            disabled={isSending} 
            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#FF4F00] transition-colors shadow-xl"
          >
            {isSending ? 'Verzenden...' : 'Verstuur Bericht'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactModal;