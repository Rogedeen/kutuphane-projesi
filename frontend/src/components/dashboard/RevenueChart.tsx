"use client";

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ sales }: { sales: any[] }) {
  const chartData = useMemo(() => {
    return sales.map((s, i) => ({
      name: `İşlem ${i + 1}`,
      amount: s.quantity * (s.book?.price || 0)
    }));
  }, [sales]);

  if (sales.length === 0) {
    return <div className="h-full flex items-center justify-center text-zinc-500 text-sm">Grafik verisi bulunamadı</div>;
  }

  return (
    <div className="h-[250px] w-full mt-4 -ml-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
          <XAxis 
            dataKey="name" 
            stroke="#a1a1aa" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
             stroke="#a1a1aa" 
             fontSize={12} 
             tickLine={false} 
             axisLine={false} 
             tickFormatter={(value) => `₺${value}`}
          />
          <Tooltip 
             contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
             itemStyle={{ color: '#fff' }}
          />
          <Line 
             type="monotone" 
             dataKey="amount" 
             stroke="#3b82f6" 
             strokeWidth={3} 
             dot={{ fill: '#0a0a0a', stroke: '#3b82f6', strokeWidth: 2, r: 4 }} 
             activeDot={{ r: 6, fill: '#3b82f6' }}
             animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
