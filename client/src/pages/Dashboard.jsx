import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Copy, Check, Trash2, CalendarDays, LogOut } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { uuid } = useParams();
  const navigate = useNavigate(); // Added for routing
  const [records, setRecords] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showToast, setShowToast] = useState(false);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(`https://officepulse-q0mw.onrender.com/api/attendance/${uuid}`);
      setRecords(response.data.records || []);
    } catch (error) {
      console.error("API Error:", error);
      setRecords([]);
    }
  };

  useEffect(() => { fetchAttendance(); }, [uuid]);

  const toggleDay = async (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isLogged = records.find(r => r.date === dateStr);
    try {
      if (isLogged) {
        await axios.delete('https://officepulse-q0mw.onrender.com/api/attendance/remove', { data: { userId: uuid, date: dateStr } });
      } else {
        await axios.post('https://officepulse-q0mw.onrender.com/api/attendance/log', { userId: uuid, date: dateStr, status: 'office' });
      }
      fetchAttendance();
    } catch (error) {
      console.error("Failed to toggle:", error);
    }
  };

  const clearCurrentMonth = async () => {
    if (!window.confirm("Are you sure you want to clear all office days for this month?")) return;
    const currentMonthRecords = records.filter(r => {
      const recDate = new Date(r.date);
      return recDate.getMonth() === currentDate.getMonth() && recDate.getFullYear() === currentDate.getFullYear();
    });
    try {
      await Promise.all(currentMonthRecords.map(r => 
        axios.delete('https://officepulse-q0mw.onrender.com/api/attendance/remove', { data: { userId: uuid, date: r.date } })
      ));
      fetchAttendance();
    } catch (error) {
      console.error("Failed to clear month:", error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // NEW FEATURE: Disconnect Session
  const handleDisconnect = () => {
    const confirmLogout = window.confirm(
      "⚠️ WARNING: Have you saved your Tracker URL?\n\nIf you haven't copied your URL, you will lose access to this dashboard forever. Click OK to clear your session and return to the home screen."
    );
    
    if (confirmLogout) {
      localStorage.removeItem('officeTrackerUuid'); // Wipes the local token
      navigate('/'); // Routes back to the Landing Page
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDayOffset = getDay(monthStart);

  // --- SMART PACING ENGINE ---
  const getQuarterStats = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentQuarter = Math.floor(today.getMonth() / 3); 
    const qStart = new Date(currentYear, currentQuarter * 3, 1);
    const qEnd = new Date(currentYear, currentQuarter * 3 + 3, 0);
    
    let totalQuarterWorkdays = 0;
    for (let d = new Date(qStart); d <= qEnd; d.setDate(d.getDate() + 1)) {
      if (!isWeekend(d)) totalQuarterWorkdays++;
    }

    let passedWorkdays = 0;
    const effectiveToday = today > qEnd ? qEnd : (today < qStart ? qStart : today);
    for (let d = new Date(qStart); d <= effectiveToday; d.setDate(d.getDate() + 1)) {
      if (!isWeekend(d)) passedWorkdays++;
    }

    const quarterOfficeRecords = records.filter(r => {
      const recDate = new Date(r.date);
      return r.status === 'office' && recDate >= qStart && recDate <= qEnd;
    });

    const officeCount = quarterOfficeRecords.length;
    const mandateTarget = Math.ceil(totalQuarterWorkdays * 0.60);
    const remainingNeeded = Math.max(0, mandateTarget - officeCount);
    const wfhAllowance = totalQuarterWorkdays - mandateTarget;
    const overallCompletionPercentage = mandateTarget > 0 ? Math.min(Math.round((officeCount / mandateTarget) * 100), 100) : 0;

    const expectedPace = Math.ceil(passedWorkdays * 0.60);
    const daysBehindPace = expectedPace - officeCount;

    let statusText = "On Right Track";
    let statusClass = "status-track";
    let barColor = "linear-gradient(90deg, #38bdf8, #0284c7)";
    let explainerText = `You are pacing perfectly with the 60% requirement.`;

    if (officeCount >= mandateTarget) {
      statusText = "Goal Met";
      statusClass = "status-met";
      barColor = "linear-gradient(90deg, #2dd4bf, #10b981)";
      explainerText = "You have met the 60% office requirement!";
    } else if (daysBehindPace <= -1) {
      statusText = "Ahead of Pace";
      statusClass = "status-track";
      barColor = "linear-gradient(90deg, #a78bfa, #8b5cf6)"; 
      explainerText = `Great job! You are ${Math.abs(daysBehindPace)} day(s) ahead of the required pace.`;
    } else if (daysBehindPace === 1 || daysBehindPace === 2) {
      statusText = "Needs Attention";
      statusClass = "status-warning";
      barColor = "linear-gradient(90deg, #facc15, #fb923c)";
      explainerText = `Slipping slightly. You are ${daysBehindPace} day(s) behind pace.`;
    } else if (daysBehindPace > 2) {
      statusText = "Falling Behind";
      statusClass = "status-critical";
      barColor = "linear-gradient(90deg, #f43f5e, #ef4444)";
      explainerText = `Danger zone. You are ${daysBehindPace} days behind pace.`;
    }

    return {
      label: `Quarter ${currentQuarter + 1} (${currentYear})`,
      dateSpan: `${format(qStart, 'MMM d')} – ${format(qEnd, 'MMM d')}`,
      officeDays: officeCount,
      target: mandateTarget,
      remaining: remainingNeeded,
      totalWorkdays: totalQuarterWorkdays,
      wfhAllowance: wfhAllowance,
      percentage: overallCompletionPercentage,
      statusText,
      statusClass,
      barColor,
      explainerText
    };
  };

  const stats = getQuarterStats();

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        
        {/* LEFT SIDE: Calendar */}
        <div className="calendar-panel">
          <div className="calendar-header">
            <h2 className="month-title">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="month-nav">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="nav-btn"><ChevronLeft size={20} /></button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="nav-btn"><ChevronRight size={20} /></button>
            </div>
          </div>
          
          <p className="instruction-text">Tap a date to mark it as an Office Day. Weekends are automatically skipped.</p>

          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="weekday-header">{day}</div>
            ))}
            {Array.from({ length: startingDayOffset }).map((_, i) => (
              <div key={`empty-${i}`}></div>
            ))}
            {daysInMonth.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isLogged = records.find(r => r.date === dateStr);
              const weekend = isWeekend(day);
              return (
                <div key={idx} onClick={() => !weekend && toggleDay(day)} className={`day-cell ${weekend ? 'disabled' : ''} ${isLogged ? 'logged' : ''}`}>
                  <span className="day-number">{format(day, 'd')}</span>
                  {isLogged && <div className="logged-dot"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE: Friendly Stats & Controls */}
        <div className="stats-panel">
          <div className="top-bar">
            {/* NEW BUTTON ADDED HERE */}
            <button onClick={handleDisconnect} className="action-btn logout-btn">
              <LogOut size={16} /> Disconnect
            </button>

            <button onClick={clearCurrentMonth} className="action-btn clear-btn">
              <Trash2 size={16} /> Clear Month
            </button>
            <button onClick={handleCopy} className="action-btn copy-btn">
              {showToast ? <Check size={16} /> : <Copy size={16} />} Save URL
            </button>
            {showToast && <div className="popup-toast">Link Copied! Bookmark it for later.</div>}
          </div>

          <div className="analysis-card">
            <div>
              <div className="analysis-header">
                <div>
                  <h3 className="analysis-title">Goal Tracker</h3>
                  <span className="date-span">{stats.label} • {stats.dateSpan}</span>
                </div>
                <div className={`status-badge ${stats.statusClass}`}>
                  {stats.statusText}
                </div>
              </div>
              
              <div className="metrics-grid">
                <div className="mini-stat">
                  <span className="mini-stat-label">Quarter Workdays</span>
                  <span className="mini-stat-value">
                    <CalendarDays size={18} className="mini-icon" style={{marginRight: '6px'}} /> {stats.totalWorkdays}
                  </span>
                </div>
                <div className="mini-stat">
                  <span className="mini-stat-label">Office Logged</span>
                  <span className="mini-stat-value accent">{stats.officeDays} / {stats.target}</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-stat-label">Safe WFH Left</span>
                  <span className="mini-stat-value">{stats.wfhAllowance}</span>
                </div>
              </div>

              <div className="stat-box highlight">
                <span className="stat-label">More Office Days Needed</span>
                <span className="stat-value">{stats.remaining === 0 ? "DONE!" : stats.remaining}</span>
                <span className="badge-explainer">{stats.explainerText}</span>
              </div>
            </div>

            <div className="progress-container">
              <div className="progress-header">
                <span>Progress to 60% Goal</span>
                <span>{stats.percentage}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${stats.percentage}%`, background: stats.barColor }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}