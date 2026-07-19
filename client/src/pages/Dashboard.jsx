import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import './Dashboard.css'; // <-- Importing our custom CSS!

export default function Dashboard() {
  const { uuid } = useParams();
  const [records, setRecords] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showToast, setShowToast] = useState(false);

  // Data Fetching
  const fetchAttendance = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/attendance/${uuid}`);
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
    const isLogged = records.find(r => r.date === dateStr);

    try {
      if (isLogged) {
        await axios.delete('http://localhost:5000/api/attendance/remove', { data: { userId: uuid, date: dateStr } });
      } else {
        await axios.post('http://localhost:5000/api/attendance/log', { userId: uuid, date: dateStr, status: 'office' });
      }
      fetchAttendance();
    } catch (error) {
      console.error("Failed to toggle:", error);
    }
  };

  // Copy to clipboard logic
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Calendar Math
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDayOffset = getDay(monthStart);

  // Quarter Math
  const getQuarterStats = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(now.getMonth() / 3); 
    const qStart = new Date(currentYear, currentQuarter * 3, 1);
    const qEnd = new Date(currentYear, currentQuarter * 3 + 3, 0);
    
    let totalQuarterWorkdays = 0;
    for (let d = new Date(qStart); d <= qEnd; d.setDate(d.getDate() + 1)) {
      if (!isWeekend(d)) totalQuarterWorkdays++;
    }

    const quarterOfficeRecords = records.filter(r => {
      const recDate = new Date(r.date);
      return r.status === 'office' && recDate >= qStart && recDate <= qEnd;
    });

    const officeCount = quarterOfficeRecords.length;
    const mandateTarget = Math.ceil(totalQuarterWorkdays * 0.60);
    const remainingNeeded = Math.max(0, mandateTarget - officeCount);

    return {
      label: `Q${currentQuarter + 1} ${currentYear}`,
      officeDays: officeCount,
      target: mandateTarget,
      remaining: remainingNeeded
    };
  };

  const stats = getQuarterStats();

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        
        {/* LEFT SIDE: The 7-Column Grid Calendar */}
        <div className="calendar-panel">
          <div className="calendar-header">
            <h2 className="month-title">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="month-nav">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="nav-btn">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="nav-btn">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {/* Weekday Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="weekday-header">{day}</div>
            ))}

            {/* Empty slots for month offset */}
            {Array.from({ length: startingDayOffset }).map((_, i) => (
              <div key={`empty-${i}`}></div>
            ))}

            {/* Actual Days */}
            {daysInMonth.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isLogged = records.find(r => r.date === dateStr);
              const weekend = isWeekend(day);

              return (
                <div
                  key={idx}
                  onClick={() => !weekend && toggleDay(day)}
                  className={`day-cell ${weekend ? 'disabled' : ''} ${isLogged ? 'logged' : ''}`}
                >
                  <span className="day-number">{format(day, 'd')}</span>
                  {isLogged && <div className="logged-dot"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE: Stats & Controls */}
        <div className="stats-panel">
          
          {/* Top Bar with URL Copy */}
          <div className="top-bar">
            <button onClick={handleCopy} className="copy-btn">
              {showToast ? <Check size={18} /> : <Copy size={18} />}
              Copy Tracker URL
            </button>
            {showToast && (
              <div className="popup-toast">
                URL Saved! Bookmark this link for next time.
              </div>
            )}
          </div>

          {/* Analysis Cards */}
          <div className="analysis-card">
            <h3 className="analysis-title">
              Quarter Analysis <span>{stats.label}</span>
            </h3>

            <div className="stat-box">
              <span className="stat-label">In-Office Presence</span>
              <span className="stat-value">{stats.officeDays} Days</span>
            </div>

            <div className="stat-box highlight">
              <span className="stat-label">Days Needed for 60%</span>
              <span className="stat-value">{stats.remaining}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}