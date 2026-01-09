
import React from 'react';
import { MetricPoint } from '../types';

interface FinancialChartProps {
  data: MetricPoint[];
  title: string;
  unit: string;
  type: 'bar' | 'line';
  color?: string;
  benchmark?: number;
}

const FinancialChart: React.FC<FinancialChartProps> = ({ data, title, unit, type, color = '#ec4899', benchmark }) => {
  if (!data || data.length === 0) return null;

  const width = 400;
  const height = 240;
  const paddingX = 45;
  const paddingY = 40;
  
  const values = data.map(d => d.value);
  const rawMax = Math.max(...values, benchmark || 0, 1);
  const rawMin = Math.min(...values, benchmark || 0, 0);
  
  const maxValue = rawMax * 1.2;
  const minValue = rawMin < 0 ? rawMin * 1.2 : 0;
  const range = maxValue - minValue;

  const getX = (index: number) => paddingX + (index * (width - 2 * paddingX) / (data.length - 1));
  const getY = (value: number) => height - paddingY - ((value - minValue) / range * (height - 2 * paddingY));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-inner transition-shadow group">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">{title}</h4>
        <span className="text-[10px] font-mono text-slate-500">{unit}</span>
      </div>
      
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Y-Axis Grid & Labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const val = minValue + (p * range);
          const y = getY(val);
          return (
            <g key={i}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#1e293b" strokeWidth="1" />
              <text x={paddingX - 8} y={y + 3} textAnchor="end" className="text-[9px] fill-slate-500 font-mono">
                {val >= 1000 ? (val/1000).toFixed(1) + 'k' : val.toFixed(val < 10 && val !== 0 ? 1 : 0)}
              </text>
            </g>
          );
        })}

        {/* Benchmark Line (e.g., 15% for ROIC) */}
        {benchmark !== undefined && benchmark <= maxValue && benchmark >= minValue && (
          <g>
            <line 
              x1={paddingX} y1={getY(benchmark)} x2={width - paddingX} y2={getY(benchmark)} 
              stroke="#475569" strokeWidth="1" strokeDasharray="4 2" 
            />
            <text x={width - paddingX + 5} y={getY(benchmark) + 3} className="text-[8px] fill-slate-500 italic">
              Ziel ({benchmark}%)
            </text>
          </g>
        )}

        {type === 'bar' ? (
          data.map((d, i) => {
            const x = getX(i);
            const y = getY(d.value);
            const barWidth = (width - 2 * paddingX) / data.length * 0.5;
            const zeroY = getY(0);
            const barHeight = Math.abs(zeroY - y);
            const barTop = d.value >= 0 ? y : zeroY;

            return (
              <g key={i} className="hover-target">
                <rect 
                  x={x - barWidth/2} 
                  y={barTop} 
                  width={barWidth} 
                  height={barHeight} 
                  fill={color} 
                  className="opacity-60 hover:opacity-100 transition-all duration-300"
                  rx="2"
                />
                <text x={x} y={height - paddingY + 18} textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">
                  {d.year}
                </text>
                <rect 
                  x={x - barWidth} y={0} width={barWidth*2} height={height} 
                  fill="transparent" className="cursor-help"
                >
                  <title>{d.year}: {d.value} {unit}</title>
                </rect>
              </g>
            );
          })
        ) : (
          <>
            {/* Area under line */}
            <path
              d={`${data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value)}`).join(' ')} L ${getX(data.length - 1)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`}
              fill={color}
              className="opacity-10"
            />
            {/* The Line */}
            <path
              d={data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value)}`).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-lg"
            />
            {/* Interaction points */}
            {data.map((d, i) => (
              <g key={i} className="group">
                <circle 
                  cx={getX(i)} 
                  cy={getY(d.value)} 
                  r="4" 
                  fill="#0f172a" 
                  stroke={color} 
                  strokeWidth="2" 
                  className="transition-all duration-200 group-hover:r-6"
                />
                <text x={getX(i)} y={height - paddingY + 18} textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">
                  {d.year}
                </text>
                <circle 
                  cx={getX(i)} cy={getY(d.value)} r="15" 
                  fill="transparent" className="cursor-help"
                >
                  <title>{d.year}: {d.value} {unit}</title>
                </circle>
              </g>
            ))}
          </>
        )}
      </svg>
    </div>
  );
};

export default FinancialChart;
