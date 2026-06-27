import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Wedding } from '../types';
import { CheckCircle2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function GuestView() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [selectedWedding, setSelectedWedding] = useState<Wedding | null>(null);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [companions, setCompanions] = useState(0);
  const [relation, setRelation] = useState('ខាងកូនកំលោះ');
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeddings = async () => {
      const { data, error } = await supabase.from('weddings').select('*').order('created_at', { ascending: false });
      if (data) {
        setWeddings(data);
        if (data.length > 0) setSelectedWedding(data[0]);
      }
    };
    fetchWeddings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWedding) return;
    
    setStatus('submitting');
    
    const { data, error } = await supabase.from('guests').insert([{
      wedding_id: selectedWedding.id,
      name,
      phone,
      companions,
      relation_type: relation,
      amount,
      note,
      status: 'pending'
    }]).select('id').single();

    if (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message);
    } else {
      setGuestId(data.id);
      setStatus('success');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-pink-50/50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4 border border-pink-100">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-800">ការចុះឈ្មោះជោគជ័យ!</h2>
          <p className="text-slate-600">
            សូមអរគុណសម្រាប់ការចូលរួម។ សូមបង្ហាញ QR Code នេះទៅកាន់អ្នកទទួលភ្ញៀវនៅពេលអញ្ជើញមកដល់។
          </p>
          
          {guestId && (
            <div className="flex justify-center my-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <QRCodeSVG value={guestId} size={200} />
            </div>
          )}

          <button 
            onClick={() => {
              setStatus('idle');
              setGuestId(null);
              setName('');
              setPhone('');
              setAmount(0);
              setCompanions(0);
              setNote('');
            }}
            className="mt-6 w-full py-3 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 transition-colors"
          >
            ត្រឡប់ក្រោយ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50/50 p-4 md:p-8">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-pink-100">
        <div className="bg-pink-600 p-6 text-center text-white relative">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden border-2 border-white/50 bg-white shadow-sm flex items-center justify-center">
            <img src="/0e0693b4ad8d4cf9bbcc1f682afe4334.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold">ចុះឈ្មោះចូលរួមមង្គលការ</h1>
          <p className="text-pink-100 mt-1">សូមបំពេញព័ត៌មានខាងក្រោម</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ជ្រើសរើសកម្មវិធី</label>
            <select 
              className="w-full border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
              value={selectedWedding?.id || ''}
              onChange={(e) => setSelectedWedding(weddings.find(w => w.id === e.target.value) || null)}
              required
            >
              {weddings.map(w => (
                <option key={w.id} value={w.id}>{w.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ឈ្មោះ (Guest Name)</label>
            <input 
              type="text" 
              required 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
              placeholder="បញ្ចូលឈ្មោះរបស់អ្នក"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">លេខទូរស័ព្ទ (Phone Number)</label>
            <input 
              type="tel" 
              required 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
              placeholder="012 345 678"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">អ្នកមកជាមួយ</label>
              <input 
                type="number" 
                min="0"
                value={companions}
                onChange={e => setCompanions(parseInt(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ចំនួនប្រាក់ចងដៃ ($)</label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                value={amount}
                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ប្រភេទទំនាក់ទំនង</label>
            <select 
              value={relation}
              onChange={e => setRelation(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value="ខាងកូនកំលោះ">ខាងកូនកំលោះ</option>
              <option value="ខាងកូនក្រមុំ">ខាងកូនក្រមុំ</option>
              <option value="មិត្តភក្តិ">មិត្តភក្តិ</option>
              <option value="ផ្សេងៗ">ផ្សេងៗ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">កំណត់សម្គាល់ (Note)</label>
            <textarea 
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none h-24 resize-none"
              placeholder="បញ្ចូលកំណត់សម្គាល់ផ្សេងៗ..."
            ></textarea>
          </div>

          {selectedWedding?.khqr_img_url && (
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-2 mb-3 text-slate-700 font-medium">
                <QrCode className="w-5 h-5" />
                <span>ស្កេន KHQR ដើម្បីវេរប្រាក់</span>
              </div>
              <img 
                src={selectedWedding.khqr_img_url} 
                alt="KHQR" 
                className="max-w-[200px] mx-auto rounded-lg shadow-sm border border-slate-200"
              />
            </div>
          )}

          {status === 'error' && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm text-center">
              {errorMessage}
            </div>
          )}

          <button 
            type="submit"
            disabled={status === 'submitting'}
            className="w-full py-3 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 transition-colors disabled:opacity-70 mt-6"
          >
            {status === 'submitting' ? 'កំពុងបញ្ជូន...' : 'បញ្ជូនព័ត៌មាន'}
          </button>
        </form>
      </div>
    </div>
  );
}
