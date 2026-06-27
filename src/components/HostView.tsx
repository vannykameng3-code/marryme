import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Guest, Wedding } from '../types';
import { Search, LogOut, Download, QrCode } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function HostView({ weddingId, onLogout }: { weddingId: string, onLogout: () => void }) {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: wData } = await supabase.from('weddings').select('*').eq('id', weddingId).single();
      if (wData) setWedding(wData);

      const { data: gData } = await supabase.from('guests').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: false });
      if (gData) setGuests(gData);
    };
    fetchData();
  }, [weddingId]);

  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.phone.includes(search)
  );

  // Stats
  const totalRegistered = guests.length;
  const approvedGuests = guests.filter(g => g.status === 'approved');
  const actualAttendees = approvedGuests.reduce((acc, curr) => acc + 1 + curr.companions, 0);
  const totalAmount = guests.reduce((acc, curr) => acc + Number(curr.amount), 0);

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
    XLSX.writeFile(workbook, `${wedding?.title || 'wedding'}_guests.xlsx`);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-800">
      <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm overflow-hidden bg-white">
            <img src="/0e0693b4ad8d4cf9bbcc1f682afe4334.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{wedding?.title || 'ទំព័រម្ចាស់កម្មវិធី'}</h1>
        </div>
        <nav className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm font-medium text-pink-600 bg-pink-50 rounded-lg border border-pink-100">ទំព័រដើម</button>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
            <LogOut className="w-4 h-4" />
            <span>ចេញពីគណនី</span>
          </button>
        </nav>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">ស្ថិតិសរុប</h2>
            <div className="space-y-4">
              <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl">
                <p className="text-xs text-pink-600 font-medium">ភ្ញៀវចុះឈ្មោះសរុប</p>
                <p className="text-2xl font-bold text-pink-900">{totalRegistered} <span className="text-sm font-normal">នាក់</span></p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs text-blue-600 font-medium">អ្នកចូលរួមពិតប្រាកដ</p>
                <p className="text-2xl font-bold text-blue-900">{actualAttendees} <span className="text-sm font-normal">នាក់</span></p>
              </div>
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-xs text-green-600 font-medium">ទឹកប្រាក់ចងដៃសរុប</p>
                <p className="text-2xl font-bold text-green-900">$ {totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">កូដ KHQR ចងដៃ</h2>
            <div className="aspect-square w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center overflow-hidden relative">
              {wedding?.khqr_img_url ? (
                <img src={wedding.khqr_img_url} alt="KHQR" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <QrCode className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                  <span className="text-[10px] text-slate-400">មិនមាន QR Code</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="flex-1 p-8 overflow-hidden flex flex-col">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">បញ្ជីឈ្មោះភ្ញៀវកិត្តិយស</h2>
              <p className="text-slate-500 text-sm">ព័ត៌មានភ្ញៀវ និងចំនួនប្រាក់ចំណងដៃ</p>
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
                    </tr>
                  ))}
                  {filteredGuests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">មិនមានទិន្នន័យទេ</td>
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

      <footer className="h-8 bg-slate-900 text-slate-400 text-[10px] flex items-center px-8 justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Supabase Connected</span>
          <span>ID: {weddingId.substring(0,8)}</span>
        </div>
        <div>រក្សាសិទ្ធិដោយ Admin Coordinator © {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
}

