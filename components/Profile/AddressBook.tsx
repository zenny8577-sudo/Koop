import React, { useState, useEffect } from 'react';
import { User, UserAddress } from '../../types';
import { supabase } from '../../src/integrations/supabase/client';

interface AddressBookProps {
  user: User;
  onUpdate: (user: User) => void;
}

const AddressBook: React.FC<AddressBookProps> = ({ user, onUpdate }) => {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newAddress, setNewAddress] = useState<Omit<UserAddress, 'id' | 'isDefault'>>({
    label: '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email,
    street: '',
    houseNumber: '',
    city: '',
    zipCode: '',
    phone: user.phone || ''
  });

  // Função auxiliar para mapear dados do Supabase (snake_case) para nossa interface (camelCase)
  const mapAddressFromDB = (data: any): UserAddress => ({
    id: data.id,
    label: data.label,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    street: data.street,
    houseNumber: data.house_number,
    city: data.city,
    zipCode: data.zip_code,
    phone: data.phone,
    isDefault: data.is_default
  });

  // Carregar endereços ao montar
  useEffect(() => {
    fetchAddresses();
  }, [user.id]);

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false }); // Padrão primeiro

      if (error) throw error;

      if (data) {
        setAddresses(data.map(mapAddressFromDB));
      }
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const addressPayload = {
        user_id: user.id,
        label: newAddress.label,
        first_name: newAddress.firstName,
        last_name: newAddress.lastName,
        email: newAddress.email,
        street: newAddress.street,
        house_number: newAddress.houseNumber,
        city: newAddress.city,
        zip_code: newAddress.zipCode,
        phone: newAddress.phone,
        is_default: addresses.length === 0 // Se for o primeiro, é padrão
      };

      const { data, error } = await supabase
        .from('addresses')
        .insert([addressPayload])
        .select()
        .single();

      if (error) throw error;

      // Atualiza lista local
      const addedAddress = mapAddressFromDB(data);
      setAddresses([...addresses, addedAddress]);
      
      setShowAddForm(false);
      setNewAddress({
        label: '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        street: '',
        houseNumber: '',
        city: '',
        zipCode: '',
        phone: user.phone || ''
      });
      
      alert('Adres succesvol toegevoegd!');
    } catch (error) {
      console.error('Failed to add address:', error);
      alert('Er is iets misgegaan. Probeer het opnieuw.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeAddress = async (id: string) => {
    if (confirm('Wilt u dit adres definitief verwijderen?')) {
      try {
        const { error } = await supabase
          .from('addresses')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setAddresses(addresses.filter(a => a.id !== id));
      } catch (error) {
        console.error('Failed to remove address:', error);
        alert('Er is iets misgegaan bij het verwijderen.');
      }
    }
  };

  const setAsDefault = async (id: string) => {
    try {
      // 1. Remove default de todos
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // 2. Define novo default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      // Recarrega para garantir consistência
      fetchAddresses();
    } catch (error) {
      console.error('Failed to set default:', error);
      alert('Er is iets misgegaan.');
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-400">Laden...</div>;
  }

  return (
    <div className="space-y-12 animate-fadeIn">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Adresboek.</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Beheer uw verzend- e factuuradressen</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)} 
          className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FF4F00] transition-all transform hover:-translate-y-1 shadow-xl shadow-slate-200"
        >
          Nieuw Adres +
        </button>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {addresses.length === 0 ? (
          <div className="md:col-span-2 py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200 text-center space-y-4">
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Geen adressen gevonden</p>
            <button 
              onClick={() => setShowAddForm(true)} 
              className="text-[#FF4F00] font-black uppercase text-xs tracking-widest underline"
            >
              Voeg uw eerste adres toe
            </button>
          </div>
        ) : (
          addresses.map(addr => (
            <div 
              key={addr.id} 
              className={`p-10 bg-white rounded-[40px] border transition-all duration-500 relative group overflow-hidden ${addr.isDefault ? 'border-[#FF4F00] shadow-2xl shadow-orange-500/5' : 'border-slate-100 hover:shadow-xl'}`}
            >
              <div className="flex justify-between items-start mb-6">
                <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${addr.isDefault ? 'bg-[#FF4F00] text-white' : 'bg-slate-50 text-slate-400'}`}>
                  {addr.label}
                </span>
                <div className="flex gap-2">
                  {!addr.isDefault && (
                    <button 
                      onClick={() => setAsDefault(addr.id)} 
                      className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-[#FF4F00] transition-colors"
                    >
                      Maak Standaard
                    </button>
                  )}
                  <button 
                    onClick={() => removeAddress(addr.id)} 
                    className="text-slate-200 hover:text-rose-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{addr.firstName} {addr.lastName}</p>
                <p className="text-sm font-medium text-slate-500">{addr.street} {addr.houseNumber}</p>
                <p className="text-sm font-medium text-slate-500">{addr.zipCode}, {addr.city}</p>
                <div className="pt-4 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{addr.phone}</p>
                </div>
              </div>
              
              {addr.isDefault && (
                <div className="absolute bottom-0 right-0 p-6 opacity-5 pointer-events-none">
                  <svg className="w-24 h-24 text-[#FF4F00]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {showAddForm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl" onClick={() => !isSaving && setShowAddForm(false)} />
          <form onSubmit={handleAdd} className="relative bg-white w-full max-w-2xl p-12 lg:p-16 rounded-[60px] shadow-3xl overflow-y-auto max-h-[92vh]">
            <header className="flex justify-between items-start mb-12">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4F00]">Verzending</span>
                <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-950 leading-none">
                  Adres <br />
                  Toevoegen.
                </h2>
              </div>
              <button 
                type="button" 
                onClick={() => !isSaving && setShowAddForm(false)} 
                className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-950 hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Label (bijv. Thuis, Kantoor, Atelier)</label>
                <input 
                  required 
                  placeholder="LABEL" 
                  value={newAddress.label} 
                  onChange={e => setNewAddress({...newAddress, label: e.target.value})} 
                  className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all uppercase tracking-tight" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Voornaam</label>
                <input 
                  required 
                  placeholder="VOORNAAM" 
                  value={newAddress.firstName} 
                  onChange={e => setNewAddress({...newAddress, firstName: e.target.value})} 
                  className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Achternaam</label>
                <input 
                  required 
                  placeholder="ACHTERNAAM" 
                  value={newAddress.lastName} 
                  onChange={e => setNewAddress({...newAddress, lastName: e.target.value})} 
                  className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" 
                />
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Straat & Huisnummer</label>
                <input 
                  required 
                  placeholder="BIJV. KEIZERSGRACHT 123" 
                  value={newAddress.street} 
                  onChange={e => setNewAddress({...newAddress, street: e.target.value})} 
                  className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Postcode</label>
                <input 
                  required 
                  placeholder="1234 AB" 
                  value={newAddress.zipCode} 
                  onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} 
                  className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Stad</label>
                <input 
                  required 
                  placeholder="AMSTERDAM" 
                  value={newAddress.city} 
                  onChange={e => setNewAddress({...newAddress, city: e.target.value})} 
                  className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" 
                />
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Telefoonnummer</label>
                <input 
                  required 
                  type="tel" 
                  placeholder="+31 6 12345678" 
                  value={newAddress.phone} 
                  onChange={e => setNewAddress({...newAddress, phone: e.target.value})} 
                  className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all" 
                />
              </div>
              
              <div className="md:col-span-2 pt-6">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-8 bg-slate-950 text-white font-black rounded-full uppercase tracking-[0.3em] text-[11px] shadow-3xl hover:bg-[#FF4F00] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Bezig met opslaan...' : 'Adres Opslaan'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddressBook;