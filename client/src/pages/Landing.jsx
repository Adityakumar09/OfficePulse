import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUuid = localStorage.getItem('officeTrackerUuid');
    if (savedUuid) {
      navigate(`/u/${savedUuid}`);
    }
  }, [navigate]);

  const generateTracker = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/user/setup');
      const newUuid = response.data.uuid;
      localStorage.setItem('officeTrackerUuid', newUuid);
      navigate(`/u/${newUuid}`);
    } catch (error) {
      console.error('Failed to create tracker:', error);
      alert('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="bg-white/[0.03] p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border border-white/10 backdrop-blur-xl relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-2xl mx-auto mb-8 shadow-[0_0_30px_rgba(6,182,212,0.3)] flex items-center justify-center">
          <span className="text-black text-2xl">🏢</span>
        </div>
        
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-4">
          Presence Protocol
        </h1>
        <p className="text-slate-400 mb-10 leading-relaxed">
          Initialize your secure workspace to track the 60% quarterly corporate mandate. No accounts. No passwords.
        </p>
        
        <button 
          onClick={generateTracker}
          disabled={loading}
          className="w-full relative group bg-white text-black font-extrabold py-5 px-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-md -z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-emerald-300 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
          <span className="relative z-10 block">{loading ? 'INITIALIZING...' : 'INITIALIZE TRACKER'}</span>
        </button>
      </div>
    </div>
  );
}