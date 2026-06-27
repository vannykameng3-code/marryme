import React, { useState } from 'react';
import GuestView from './components/GuestView';
import AdminView from './components/AdminView';
import HostView from './components/HostView';
import { supabase } from './lib/supabase';
import { Heart, Lock, KeyRound } from 'lucide-react';

type ViewState = 'landing' | 'guest' | 'admin' | 'host' | 'admin-login' | 'host-login';

export default function App() {
  const [view, setView] = useState<ViewState>('landing');
  
  // Auth states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // For Host View
  const [weddingId, setWeddingId] = useState<string>('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const { data, error } = await supabase.from('admins')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();
      
    if (data) {
      setView('admin');
      setUsername('');
      setPassword('');
    } else {
      setAuthError('គណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវ!');
    }
  };

  const handleHostLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const { data, error } = await supabase.from('weddings')
      .select('id')
      .eq('host_username', username)
      .eq('host_password', password)
      .single();
      
    if (data) {
      setWeddingId(data.id);
      setView('host');
      setUsername('');
      setPassword('');
    } else {
      setAuthError('គណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវ!');
    }
  };

  const logout = () => {
    setView('landing');
    setWeddingId('');
    setUsername('');
    setPassword('');
    setAuthError('');
  };

  const resetToLanding = () => {
    setView('landing');
    setUsername('');
    setPassword('');
    setAuthError('');
  }

  if (view === 'guest') return <GuestView />;
  if (view === 'admin') return <AdminView onLogout={logout} />;
  if (view === 'host') return <HostView weddingId={weddingId} onLogout={logout} />;

  // Landing & Login Views
  return (
    <div className="min-h-screen bg-pink-50/50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-pink-100">
        
        {view === 'landing' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden border-4 border-pink-50 shadow-sm bg-white">
              <img src="/0e0693b4ad8d4cf9bbcc1f682afe4334.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Wedding Guest App</h1>
            <p className="text-slate-500">សូមជ្រើសរើសតួនាទីរបស់អ្នក ដើម្បីចូលប្រើប្រាស់ប្រព័ន្ធ</p>
            
            <div className="space-y-3 mt-8">
              <button 
                onClick={() => setView('guest')}
                className="w-full py-4 bg-pink-600 text-white rounded-2xl font-medium hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200 flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5" /> ភ្ញៀវកិត្តិយស (Guest)
              </button>
              
              <button 
                onClick={() => setView('admin-login')}
                className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" /> អ្នកគ្រប់គ្រង (Admin)
              </button>
              
              <button 
                onClick={() => setView('host-login')}
                className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <KeyRound className="w-5 h-5" /> ម្ចាស់កម្មវិធី (Host)
              </button>
            </div>
          </div>
        )}

        {(view === 'admin-login' || view === 'host-login') && (
          <form onSubmit={view === 'admin-login' ? handleAdminLogin : handleHostLogin} className="p-8 space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800">
                {view === 'admin-login' ? 'ចូលគណនីអ្នកគ្រប់គ្រង' : 'ចូលគណនីម្ចាស់កម្មវិធី'}
              </h2>
              <p className="text-slate-500 mt-2">សូមបញ្ចូលគណនីរបស់អ្នក</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ឈ្មោះគណនី (Username)</label>
                <input 
                  type="text" 
                  required 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none bg-slate-50"
                  placeholder="បញ្ចូលឈ្មោះគណនី"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">លេខសម្ងាត់ (Password)</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none bg-slate-50"
                  placeholder="បញ្ចូលលេខសម្ងាត់"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm text-center">
                {authError}
              </div>
            )}

            <div className="pt-4 space-y-3">
              <button 
                type="submit"
                className="w-full py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 transition-colors"
              >
                ចូលប្រព័ន្ធ
              </button>
              <button 
                type="button"
                onClick={resetToLanding}
                className="w-full py-3 text-slate-500 hover:text-slate-800 font-medium transition-colors"
              >
                ត្រឡប់ក្រោយ
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
