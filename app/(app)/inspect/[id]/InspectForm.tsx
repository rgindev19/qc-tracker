"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitVerdict } from './actions';
import styles from './Inspect.module.css';

type Props = {
  inspectionId: string;
  initialNotes?: string | null;
  isCompleted: boolean;
};

export default function InspectForm({ inspectionId, initialNotes, isCompleted }: Props) {
  const [notes, setNotes] = useState(initialNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAction = async (status: 'passed' | 'rejected' | 'rework') => {
    if (isCompleted) return; // Prevent double submission
    
    // Add a quick confirmation dialog for safety
    if (!confirm(`Are you sure you want to mark this job as ${status.toUpperCase()}?`)) return;

    setIsSubmitting(true);
    
    const result = await submitVerdict(inspectionId, status, notes);

    if (result.success) {
      alert(`Inspection recorded successfully.`);
      router.push('/');
    } else {
      alert("Error saving the inspection. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <div className={styles.formSection}>
        <div>
          <label className={styles.dataLabel}>Final QC Notes</label>
          <div className={styles.textarea} style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}>
            {notes || "No notes provided."}
          </div>
        </div>
        <div className={styles.completedBanner}>
          Inspection Clock Stopped
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formSection}>
      <div>
        <label className={styles.dataLabel} htmlFor="qcNotes">Quality Control Notes</label>
        <textarea 
          id="qcNotes"
          className={styles.textarea} 
          placeholder="Enter measurements, deviations, or reason for rejection here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className={styles.buttonGrid}>
        <button 
          onClick={() => handleAction('passed')} 
          disabled={isSubmitting}
          className={`${styles.actionBtn} ${styles.passBtn}`}
        >
          PASS
        </button>
        
        <button 
          onClick={() => handleAction('rework')} 
          disabled={isSubmitting}
          className={`${styles.actionBtn} ${styles.reworkBtn}`}
        >
          REWORK
        </button>
        
        <button 
          onClick={() => handleAction('rejected')} 
          disabled={isSubmitting}
          className={`${styles.actionBtn} ${styles.rejectBtn}`}
        >
          REJECT
        </button>
      </div>
    </div>
  );
}