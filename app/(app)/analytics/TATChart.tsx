"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function TATChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <XAxis 
          dataKey="job" 
          stroke="#111827" 
          fontWeight={800} 
          tick={{ fill: '#111827' }} 
        />
        <YAxis 
          stroke="#111827" 
          fontWeight={800} 
          tick={{ fill: '#111827' }} 
          label={{ value: 'Hours', angle: -90, position: 'insideLeft', fontWeight: 800 }} 
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#111827', color: '#fff', border: 'none', fontWeight: 700 }}
          itemStyle={{ color: '#fff' }}
        />
        {/* Draw a red line across the chart at the 2-hour mark to visualize the target */}
        <ReferenceLine y={2} stroke="#dc2626" strokeWidth={3} strokeDasharray="5 5" label={{ position: 'top', value: '2hr Target', fill: '#dc2626', fontWeight: 900 }} />
        <Bar dataKey="tat" fill="#2563eb" stroke="#111827" strokeWidth={3} name="Elapsed Time" />
      </BarChart>
    </ResponsiveContainer>
  );
}