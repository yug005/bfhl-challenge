import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity } from 'lucide-react';

export default function Header() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/bfhl`);
        if (response.data.operation_code === 1) {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch (err) {
        setStatus('offline');
      }
    };
    checkApi();
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <Activity size={20} />
          </div>
          <h1 className="font-bold text-xl text-slate-800 tracking-tight">
            BFHL Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium">
          {status === 'checking' && (
            <span className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></span>
              Checking API...
            </span>
          )}
          {status === 'online' && (
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              API Online
            </span>
          )}
          {status === 'offline' && (
            <span className="flex items-center gap-1.5 text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              API Offline
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
