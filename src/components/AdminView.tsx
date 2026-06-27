import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Guest, Wedding } from '../types';
import { Search, Plus, Check, Trash2, LogOut, Download, Scan, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import QRScanner from './QRScanner';

export default function AdminView({ onLogout }: { onLogout: () => void }) {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState('');
  
  // New Wedding Form
  const [showNewWedding, setShowNewWedding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newHostUsername, setNewHostUsername] = useState('');
  const [newHostPassword, setNewHostPassword] = useState('');
  const [newKhqr, setNewKhqr] = useState('');

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const fetchWeddings = async () => {
    const { data } = await supabase.from('weddings').select('*').order('created_at', { ascending: false });
    if (data) {
      setWeddings(data);
      if (data.length > 0 && !selectedWeddingId) {
        setSelectedWeddingId(data[0].id);
      }
    }
  };

  const fetchGuests = async () => {
    if (!selectedWeddingId) return;
    const { data } = await supabase.from('guests').select('*').eq('wedding_id', selectedWeddingId).order('created_at', { ascending: false });
    if (data) setGuests(data);
  };

  const handleScanSuccess = async (decodedText: string) => {
    // Prevent multiple calls if already showing a message
    if (scanMessage) return;

    try {
      // Find guest in current list
      const guest = guests.find(g => g.id === decodedText);
      
      if (guest) {
        if (guest.status === 'pending') {
          await supabase.from('guests').update({ status: 'approved' }).eq('id', guest.id);
          setScanMessage({ type: 'success', text: `បានអនុម័តភ្ញៀវ៖ ${guest.name}` });
          fetchGuests(); // Refresh list
        } else {
          setScanMessage({ type: 'success', text: `ភ្ញៀវនេះបានអនុម័តរួចហើយ៖ ${guest.name}` });
        }
      } else {
        // Try searching database if not in current wedding list (maybe wrong wedding selected)
        const { data } = await supabase.from('guests').select('name').eq('id', decodedText).single();
        if (data) {
          setScanMessage({ type: 'error', text: `រកឃើញភ្ញៀវ ${data.name} ប៉ុន្តែមិនមែនក្នុងកម្មវិធីនេះទេ!` });
        } else {
          setScanMessage({ type: 'error', text: 'រកមិនឃើញទិន្នន័យភ្ញៀវនេះទេ!' });
        }
      }
    } catch (e) {
      setScanMessage({ type: 'error', text: 'កូដ QR មិនត្រឹមត្រូវ' });
    }

    // Auto-clear message
    setTimeout(() => {
      setScanMessage(null);
    }, 3000);
  };

  useEffect(() => {
    fetchWeddings();
  }, []);

  useEffect(() => {
    fetchGuests();
  }, [selectedWeddingId]);

  const handleCreateWedding = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('weddings').insert([{
      title: newTitle,
      host_username: newHostUsername,
      host_password: newHostPassword,
      khqr_img_url: newKhqr
    }]).select();

    if (!error && data) {
      setShowNewWedding(false);
      setNewTitle('');
      setNewHostUsername('');
      setNewHostPassword('');
      setNewKhqr('');
      fetchWeddings();
      setSelectedWeddingId(data[0].id);
    } else {
      alert(error?.message || 'Error creating wedding');
    }
  };

  const updateGuestStatus = async (id: string, status: 'approved' | 'pending') => {
    await supabase.from('guests').update({ status }).eq('id', id);
    fetchGuests();
  };

  const deleteGuest = async (id: string) => {
    if (confirm('តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ?')) {
      await supabase.from('guests').delete().eq('id', id);
      fetchGuests();
    }
  };

  const exportToExcel = () => {
    const data = filteredGuests.map((g, index) => ({
      'ល.រ': index + 1,
      'ឈ្មោះ': g.name,
      'លេខទូរស័ព្ទ': g.phone,
      'អ្នកមកជាមួយ (នាក់)': g.companions,
      'សរុប (នាក់)': g.companions + 1,
      'ចំណងដៃ ($)': g.amount,
      'ទំនាក់ទំនង': g.relation_type,
      'កំណត់សម្គាល់': g.note || '',
      'ស្ថានភាព': g.status === 'approved' ? 'យល់ព្រម' : 'រង់ចាំ'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guests");
    XLSX.writeFile(workbook, `guests_admin.xlsx`);
  };

  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.phone.includes(search)
  );

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-800">
      <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm overflow-hidden bg-white">
            <img src="/0e0693b4ad8d4cf9bbcc1f682afe4334.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">ទំព័រអ្នកគ្រប់គ្រង</h1>
        </div>
        <nav className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg border border-slate-200">ទំព័រដើម</button>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
            <LogOut className="w-4 h-4" />
            <span>ចេញពីគណនី</span>
          </button>
        </nav>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">ជ្រើសរើសកម្មវិធី</h2>
            <div className="space-y-4">
              <select 
                value={selectedWeddingId}
                onChange={e => setSelectedWeddingId(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              >
                {weddings.map(w => (
                  <option key={w.id} value={w.id}>{w.title}</option>
                ))}
                {weddings.length === 0 && <option value="">គ្មានកម្មវិធីទេ</option>}
              </select>
              
              <button 
                onClick={() => setShowNewWedding(!showNewWedding)}
                className="w-full flex items-center justify-center gap-2 bg-pink-50 text-pink-600 border border-pink-100 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-pink-100 transition-colors"
              >
                <Plus className="w-4 h-4" /> បង្កើតកម្មវិធីថ្មី
              </button>
            </div>
          </div>

          {showNewWedding && (
            <form onSubmit={handleCreateWedding} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-sm text-slate-800">ព័ត៌មានកម្មវិធីថ្មី</h3>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">ឈ្មោះកម្មវិធី</label>
                <input required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm outline-none focus:border-pink-500" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">URL រូបភាព KHQR</label>
                <input type="url" value={newKhqr} onChange={e => setNewKhqr(e.target.value)} className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm outline-none focus:border-pink-500" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">គណនីម្ចាស់កម្មវិធី</label>
                <input required type="text" value={newHostUsername} onChange={e => setNewHostUsername(e.target.value)} className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm outline-none focus:border-pink-500" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">លេខសម្ងាត់</label>
                <input required type="text" value={newHostPassword} onChange={e => setNewHostPassword(e.target.value)} className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm outline-none focus:border-pink-500" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowNewWedding(false)} className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded font-medium">បោះបង់</button>
                <button type="submit" className="px-3 py-1 bg-slate-800 text-white rounded text-xs font-medium hover:bg-slate-700">រក្សាទុក</button>
              </div>
            </form>
          )}
        </aside>

        <section className="flex-1 p-8 overflow-hidden flex flex-col">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">គ្រប់គ្រងភ្ញៀវកិត្តិយស</h2>
              <p className="text-slate-500 text-sm">យល់ព្រម និងលុបទិន្នន័យភ្ញៀវដែលបានចុះឈ្មោះ</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="ស្វែងរកឈ្មោះ ឬលេខទូរស័ព្ទ..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none w-64" 
                />
                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              </div>
              <button 
                onClick={() => setIsScanning(true)}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-semibold shadow-md shadow-pink-200 hover:bg-pink-700"
              >
                <Scan className="w-4 h-4" /> ស្កេនកូដ QR
              </button>
              <button 
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200"
              >
                <Download className="w-4 h-4" /> ទាញយក Excel
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">ឈ្មោះ</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">ចំនួននាក់</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">ទំនាក់ទំនង</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">ចំនួនប្រាក់</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">ស្ថានភាព</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGuests.map(guest => (
                    <tr key={guest.id} className={`hover:bg-slate-50/50 transition-colors ${guest.status === 'pending' ? 'bg-pink-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{guest.name}</div>
                        <div className="text-xs text-slate-400">{guest.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono">+{guest.companions}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          guest.relation_type.includes('កូនក្រមុំ') ? 'bg-pink-100 text-pink-600' :
                          guest.relation_type.includes('កូនកំលោះ') ? 'bg-blue-100 text-blue-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {guest.relation_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        {guest.amount > 0 ? `$ ${guest.amount.toFixed(2)}` : <span className="text-slate-400">$ --.--</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {guest.status === 'approved' ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">បានយល់ព្រម</span>
                        ) : (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">រង់ចាំ</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {guest.status === 'pending' && (
                            <button 
                              onClick={() => updateGuestStatus(guest.id, 'approved')}
                              className="p-1.5 text-green-600 bg-white border border-slate-200 rounded hover:border-green-600 transition-colors"
                              title="យល់ព្រម"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteGuest(guest.id)}
                            className="p-1.5 text-red-500 bg-white border border-slate-200 rounded hover:border-red-400 transition-colors"
                            title="លុប"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredGuests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">មិនមានទិន្នន័យទេ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>បង្ហាញ {filteredGuests.length > 0 ? 1 : 0} ដល់ {filteredGuests.length} នៃ ភ្ញៀវ {guests.length} នាក់</span>
            </div>
          </div>
        </section>
      </main>

      {/* QR Scanner Modal */}
      {isScanning && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Scan className="w-5 h-5 text-pink-500" />
                ស្កេនកូដ QR ភ្ញៀវ
              </h3>
              <button 
                onClick={() => setIsScanning(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 relative flex-1 overflow-y-auto">
              {scanMessage && (
                <div className={`mb-4 p-4 rounded-xl text-center font-bold text-sm shadow-sm ${
                  scanMessage.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {scanMessage.text}
                </div>
              )}
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <QRScanner 
                  onScanSuccess={handleScanSuccess} 
                  onScanFailure={() => {}} 
                />
                <p className="text-center text-xs text-slate-500 mt-4">
                  សូមដាក់ QR Code អោយចំកាមេរ៉ា ដើម្បីស្កេនដោយស្វ័យប្រវត្តិ
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <footer className="h-8 bg-slate-900 text-slate-400 text-[10px] flex items-center px-8 justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Supabase Connected</span>
          <span>Role: System Admin</span>
        </div>
        <div>រក្សាសិទ្ធិដោយ Admin Coordinator © {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
}
