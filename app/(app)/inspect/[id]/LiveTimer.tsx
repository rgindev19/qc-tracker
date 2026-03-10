"use client";

import { useState, useEffect, useRef } from 'react';
import styles from './LiveTimer.module.css';

type Props = {
  timeReceived: string;
  targetTatHours: number;
  isCompleted: boolean;
  timeCompleted?: string | null;
};

export default function LiveTimer({ timeReceived, targetTatHours, isCompleted, timeCompleted }: Props) {
  const [displayedTime, setDisplayedTime] = useState("00:00:00");
  const [status, setStatus] = useState<'safe' | 'warning' | 'breached' | 'completed'>('safe');
  const [isAlarmArmed, setIsAlarmArmed] = useState(false); // Default to off for browser policies

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // If it's already done, just calculate the final time once and stop
    if (isCompleted) {
      setStatus('completed');
      const start = new Date(timeReceived).getTime();
      const end = timeCompleted ? new Date(timeCompleted).getTime() : new Date().getTime();
      setDisplayedTime(formatTimeDiff(start, end));

      // Stop the alarm immediately if the inspection is finished
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return;
    }

    // Otherwise, start the live ticking clock
    const targetMs = targetTatHours * 60 * 60 * 1000;
    const warningMs = targetMs * 0.8; // Warn at 80% time

    const interval = setInterval(() => {
      const start = new Date(timeReceived).getTime();
      const now = new Date().getTime();
      const diffMs = now - start;

      setDisplayedTime(formatTimeDiff(start, now));

      if (diffMs >= targetMs) {
        setStatus('breached');
      } else if (diffMs >= warningMs) {
        setStatus('warning');
      } else {
        setStatus('safe');
      }
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [timeReceived, targetTatHours, isCompleted, timeCompleted]);

  // A separate useEffect specifically for handling the audio playback
  useEffect(() => {
    if (!audioRef.current) return;

    if (status === 'breached' && isAlarmArmed && !isCompleted) {
      // Play the alarm if breached, armed, and not completed
      audioRef.current.play().catch(e => console.log("Browser blocked autoplay:", e));
    } else {
      // Otherwise, keep it quiet
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [status, isAlarmArmed, isCompleted]);

  // Helper function to turn milliseconds into HH:MM:SS
  const formatTimeDiff = (start: number, end: number) => {
    const totalSeconds = Math.floor((end - start) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // ADD THIS FUNCTION RIGHT HERE:
  const toggleAlarm = () => {
    setIsAlarmArmed(!isAlarmArmed);
  };

  return (
    <div className={styles.timerWrapper}>

      {/* The Hidden Audio Element (looping enabled) */}
      <audio ref={audioRef} src="/alarm.mp3" loop preload="auto" />

      <div className={styles.label}>
        {isCompleted ? "Final Inspection Time" : "Live Elapsed Time"}
      </div>
      {/* Only show the arming button if the inspection is still active */}
        {!isCompleted && (
          <button 
            onClick={toggleAlarm} 
            className={`${styles.alarmBtn} ${isAlarmArmed ? styles.alarmArmed : styles.alarmMuted}`}
            title="Browsers require a click to allow audio. Click to arm the siren."
          >
            {isAlarmArmed ? "🔊 ALARM: ARMED" : "🔇 ALARM: MUTED"}
          </button>
        )}
      <div className={`${styles.timerBox} ${styles[status]}`}>
        {displayedTime}
      </div>
    </div>
  );
}