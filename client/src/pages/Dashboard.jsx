import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, getDay } from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Briefcase, Home, Target } from 'lucide-react';

export default function Dashboard() {
  const { uuid } = useParams();
  const [records, setRecords] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // 1. Bulletproof Data Fetching
  const fetchAttendance = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/attendance/${uuid}`);
      // Ensure we always set an array, even if the API fails, to prevent crashes
      setRecords(response.data.records || []);
    } catch (error) {
      console.error("API Error:", error);
      setRecords([]); 
    }
  };

  useEffect(() => { 
    fetchAttendance(); 
  }, [uuid]);

  const toggleDay = async (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isLogged = records?.find(r => r.date === dateStr);

    try {
      if (isLogged) {
        await axios.delete('http://localhost:5000/api/attendance/remove', { data: { userId: uuid, date: dateStr } });
      } else {
        await axios.post('http://localhost:5000/api/attendance/log', { userId: uuid, date: dateStr, status: 'office' });
      }
      fetchAttendance();
    } catch (error) {
      console.error("Failed to toggle day:", error);
    }
  };

  // 2. Accurate Calendar Math & Offsets
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Gets the day of the week the month starts on (0 = Sunday, 1 = Monday, etc.)
  const startingDayOffset = getDay(monthStart); 

  // 3. Dynamic Stats Logic
  // Total weekdays in the currently viewed month
  const workingDaysInMonth = daysInMonth.filter(d => !isWeekend(d)).length;
  
  // Office days logged in the currently viewed month
  const officeDays = records?.filter(r => {
    const recordDate = new Date(r.date);
    return r.status === 'office' && recordDate.getMonth() === currentDate.getMonth() && recordDate.getFullYear() === currentDate.getFullYear();
  }).length || 0;

  // Remaining working days automatically become WFH days
  const wfhDays = workingDaysInMonth - officeDays;
  
  // Example Target: 60% of the working days in this specific month
  const targetOfficeDays = Math.ceil(workingDaysInMonth * 0.60);
  const remainingTarget = Math.max(0, targetOfficeDays - officeDays);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 flex flex-col lg:flex-row gap-8 font-sans">
      
      {/* LEFT: The Calendar Grid */}
      <div className="flex-1 bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent uppercase tracking-wider">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 md:gap-3">
          {/* Days of the Week Header */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest py-2">
              {day}
            </div>
          ))}

          {/* Invisible padding divs so the 1st of the month lands on the correct weekday */}
          {Array.from({ length: startingDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 md:h-28 rounded-2xl"></div>
          ))}

          {/* Actual Calendar Days */}
          {daysInMonth.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isLogged = records?.find(r => r.date === dateStr);
            const weekend = isWeekend(day);

            return (
              <motion.button
                key={idx}
                whileHover={!weekend ? { scale: 0.95 } : {}}
                whileTap={!weekend ? { scale: 0.90 } : {}}
                onClick={() => !weekend && toggleDay(day)}
                disabled={weekend}
                className={`h-24 md:h-28 rounded-2xl flex flex-col p-3 md:p-4 border transition-all relative overflow-hidden group ${
                  weekend ? 'bg-[#0a0a0a] border-white/5 cursor-not-allowed opacity-20' : 
                  isLogged ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#111] border-white/10 hover:border-cyan-500/30'
                }`}
              >
                {/* Glow effect on hover for clickable days */}
                {!weekend && !isLogged && (
                  <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
                
                <span className={`text-lg md:text-xl font-bold z-10 ${isLogged ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {format(day, 'd')}
                </span>
                
                {isLogged && (
                  <span className="mt-auto text-[10px] md:text-xs font-bold text-emerald-400 uppercase tracking-widest z-10">
                    Office
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Stats Dashboard */}
      <div className="lg:w-[400px] space-y-6">
        <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-2xl">
          <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-8 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Monthly Status
          </h3>
          
          <div className="space-y-4">
            <StatCard label="In-Office Days" value={officeDays} icon={<Briefcase size={20}/>} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
            <StatCard label="Remote / WFH" value={wfhDays} icon={<Home size={20}/>} color="text-cyan-400" bg="bg-cyan-500/10" border="border-cyan-500/20" />
            
            <div className="h-px w-full bg-white/10 my-6"></div>
            
            <StatCard label="60% Target Remaining" value={remainingTarget} icon={<Target size={20}/>} color="text-rose-400" bg="bg-rose-500/10" border="border-rose-500/20" />
          </div>
        </div>
      </div>
      
    </div>
  );
}

function StatCard({ label, value, icon, color, bg, border }) {
  return (
    <div className={`flex items-center justify-between p-5 rounded-2xl border ${border} ${bg}`}>
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg bg-black/40 ${color}`}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-slate-200">{label}</span>
      </div>
      <span className={`text-3xl font-black ${color}`}>{value}</span>
    </div>
  );
}