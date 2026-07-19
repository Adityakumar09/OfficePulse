import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Terminal, ShieldCheck, Fingerprint, Activity } from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const [typedText, setTypedText] = useState('');
  const navigate = useNavigate();
  
  const fullText = "SYSTEM READY";

  // Typewriter effect for the badge
  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);
    return () => clearInterval(typingInterval);
  }, []);

  // Check if they already have an active session
  useEffect(() => {
    const savedUuid = localStorage.getItem('officeTrackerUuid');
    if (savedUuid) {
      navigate(`/u/${savedUuid}`);
    }
  }, [navigate]);

  const generateTracker = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://officepulse-q0mw.onrender.com/api/user/setup');
      const newUuid = response.data.uuid;
      localStorage.setItem('officeTrackerUuid', newUuid);
      
      // Artificial delay for the "secure handshake" aesthetic
      setTimeout(() => {
        navigate(`/u/${newUuid}`);
      }, 800);
      
    } catch (error) {
      console.error('Failed to create tracker:', error);
      alert('Connection to server failed. Verify backend is running.');
      setLoading(false);
    }
  };

  return (
    <div className="landing-wrapper">
      <div className="landing-glass-card">
        
        {/* Terminal Header */}
        <div className="terminal-top-bar">
          <div className="term-dot dot-red"></div>
          <div className="term-dot dot-yellow"></div>
          <div className="term-dot dot-green"></div>
        </div>

        <div className="landing-content">
          <div className="cli-badge">
            <Terminal size={14} />
            {typedText}
            <span className="blinking-cursor"></span>
          </div>

          <h1 className="landing-title">Quarterly Presence Engine</h1>
          <p className="landing-subtitle">
            A secure, frictionless dashboard to audit your 60% office mandate. Track your pacing in real-time.
          </p>

          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon"><Fingerprint size={20} /></div>
              <div className="trust-text">
                <h4>Zero Accounts Required</h4>
                <p>No passwords. Authentication is handled via a secure URL hash.</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><ShieldCheck size={20} /></div>
              <div className="trust-text">
                <h4>Private Node Generation</h4>
                <p>Your session token is stored exclusively in your local browser.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={generateTracker} 
            disabled={loading}
            className="generate-btn"
          >
            {loading ? (
              <><Activity size={20} className="animate-spin" /> ESTABLISHING SECURE LINK...</>
            ) : (
              <><Terminal size={20} /> INITIALIZE TRACKER</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}