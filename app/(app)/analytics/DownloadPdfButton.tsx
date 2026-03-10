"use client";

import styles from './Analytics.module.css';

export default function DownloadPdfButton() {
  const handlePrint = () => {
    // Triggers the browser's high-res print/PDF dialog
    window.print();
  };

  return (
    <button onClick={handlePrint} className={styles.downloadBtn}>
      💾 SAVE AS PDF
    </button>
  );
}