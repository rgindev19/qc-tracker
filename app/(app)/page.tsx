"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    // 1. Fetch data from local storage
    const fetchLocalData = () => {
      const storedData = JSON.parse(localStorage.getItem('qc_reports') || '[]');
      setReports(storedData);
    };

    fetchLocalData();
    
    // 2. Keep the table data fresh
    const dataInterval = setInterval(fetchLocalData, 2000);
    
    // 3. Make the clock tick every single second!
    const clockInterval = setInterval(() => setCurrentTime(Date.now()), 1000);
    
    return () => {
      clearInterval(dataInterval);
      clearInterval(clockInterval);
    };
  }, []);

  // --- TRIGGER THE CLOCK ---
  const handleStartInspection = (index: number) => {
    const currentReports = [...reports];
    
    // Mark it as started and save the exact millisecond they clicked the button
    currentReports[index].status = 'IN PROGRESS';
    currentReports[index].startTime = Date.now(); 
    
    localStorage.setItem('qc_reports', JSON.stringify(currentReports));
    setReports(currentReports);
  };

  // --- FINISH AND REMOVE ---
  const handleFinish = (index: number) => {
    if (!window.confirm("Are you sure this part is finished and ready to be removed from the queue?")) return;
    const currentReports = [...reports];
    currentReports.splice(index, 1);
    localStorage.setItem('qc_reports', JSON.stringify(currentReports));
    setReports(currentReports);
  };

  // --- CALCULATE LIVE ELAPSED TIME ---
  const getElapsedTime = (startTime: number) => {
    if (!startTime) return "00:00:00";
    const diffInSeconds = Math.floor((currentTime - startTime) / 1000);
    
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;
    
    // Format to look like a digital clock (e.g., 01:05:09)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: '0' }}>QC CONTROL CENTER</h1>
          <p style={{ margin: '0', color: '#555' }}>ISO-9001 Turnaround Time Tracker</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ padding: '10px 20px', backgroundColor: '#fbbf24', border: '2px solid black', fontWeight: 'bold', cursor: 'pointer' }}>
            📊 VIEW MONTHLY REPORT
          </button>
          <Link href="/log-part">
            <button style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: '2px solid black', fontWeight: 'bold', cursor: 'pointer' }}>
              + LOG INCOMING PART
            </button>
          </Link>
        </div>
      </div>

      <hr style={{ border: '2px solid black', marginBottom: '20px' }} />

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '3px solid black', textAlign: 'center' }}>
        <thead>
          <tr style={{ borderBottom: '3px solid black', backgroundColor: '#f9fafb' }}>
            <th style={{ padding: '15px', borderRight: '2px solid black' }}>QC ID / JOB NO.</th>
            <th style={{ padding: '15px', borderRight: '2px solid black' }}>PART DESCRIPTION</th>
            <th style={{ padding: '15px', borderRight: '2px solid black' }}>QTY</th>
            <th style={{ padding: '15px', borderRight: '2px solid black' }}>ELAPSED / TARGET TAT</th>
            <th style={{ padding: '15px', borderRight: '2px solid black' }}>STATUS</th>
            <th style={{ padding: '15px' }}>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: '30px', fontWeight: 'bold' }}>
                No parts currently in the QC queue.
              </td>
            </tr>
          ) : (
            reports.map((report, index) => {
              const isInProgress = report.status === 'IN PROGRESS';
              
              return (
                <tr key={index} style={{ borderBottom: '2px solid black' }}>
                  <td style={{ padding: '15px', borderRight: '2px solid black', fontWeight: 'bold' }}>
                    {report.tcnNo || report['tcn-no'] || report.tcn_no || report.jobNo || 'N/A'}
                  </td>
                  <td style={{ padding: '15px', borderRight: '2px solid black' }}>
                    {report.partDescription || report['part-description'] || report.part_description || report.description || 'N/A'}
                  </td>
                  <td style={{ padding: '15px', borderRight: '2px solid black' }}>
                    {report.lotQuantity || report['lot-quantity'] || report.lot_quantity || report.quantity || report.qty || 'N/A'}
                  </td>
                  
                  {/* LIVE CLOCK DISPLAY */}
                  <td style={{ padding: '15px', borderRight: '2px solid black', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                    <span style={{ color: isInProgress ? '#ef4444' : 'black', fontWeight: isInProgress ? 'bold' : 'normal' }}>
                      {isInProgress ? getElapsedTime(report.startTime) : '00:00:00'}
                    </span>
                    <br />
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      / {report.targetTat || report['target-tat'] || report.target_tat || report.tat || 'N/A'}
                    </span>
                  </td>
                  
                  {/* STATUS DISPLAY */}
                  <td style={{ padding: '15px', borderRight: '2px solid black', color: isInProgress ? '#d97706' : '#6b7280', fontWeight: 'bold' }}>
                    {isInProgress ? 'IN PROGRESS' : 'WAITING'}
                  </td>
                  
                  {/* DYNAMIC ACTION BUTTON */}
                  <td style={{ padding: '15px' }}>
                    {isInProgress ? (
                      <button 
                        onClick={() => handleFinish(index)}
                        style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: '2px solid black', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        FINISH
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStartInspection(index)}
                        style={{ padding: '8px 16px', backgroundColor: '#22c55e', color: 'white', border: '2px solid black', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        ▶ START INSPECTION
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </main>
  );
}