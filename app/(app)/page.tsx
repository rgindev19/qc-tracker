"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
// Import your plain CSS file if you have one, e.g., import styles from './page.module.css';

export default function Dashboard() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    // 1. When the dashboard loads, grab all the reports from local storage
    const fetchLocalData = () => {
      const storedData = JSON.parse(localStorage.getItem('qc_reports') || '[]');
      setReports(storedData);
    };

    fetchLocalData();

    // Optional: Auto-refresh the table every couple of seconds just in case
    const interval = setInterval(fetchLocalData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header Section */}
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

      {/* Table Section */}
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
            // 2. Loop through the saved reports and create a row for each one
            reports.map((report, index) => (
              <tr key={index} style={{ borderBottom: '2px solid black' }}>
                <td style={{ padding: '15px', borderRight: '2px solid black', fontWeight: 'bold' }}>
                  {report['tcn-no'] || report.tcnNo || report.jobNo || 'N/A'}
                </td>
                <td style={{ padding: '15px', borderRight: '2px solid black' }}>
                  {report['part-description'] || report.partDescription || 'N/A'}
                </td>
                <td style={{ padding: '15px', borderRight: '2px solid black' }}>
                  {report['lot-quantity'] || report.lotQuantity || 'N/A'}
                </td>
                <td style={{ padding: '15px', borderRight: '2px solid black' }}>
                  {report['target-tat'] || report.targetTat || 'N/A'}
                </td>
                <td style={{ padding: '15px', borderRight: '2px solid black', color: '#d97706', fontWeight: 'bold' }}>
                  IN PROGRESS
                </td>
                <td style={{ padding: '15px' }}>
                  <button style={{ padding: '5px 10px', backgroundColor: '#ef4444', color: 'white', border: '1px solid black', cursor: 'pointer' }}>
                    FINISH
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}