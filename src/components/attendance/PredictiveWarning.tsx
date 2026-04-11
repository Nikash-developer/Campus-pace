// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, TrendingDown, Target } from 'lucide-react';

interface PredictiveWarningProps {
  percentage: number;
  needed: number;
  risk: string;
  theme: any;
}

export const PredictiveWarning: React.FC<PredictiveWarningProps> = ({
  percentage,
  needed,
  risk,
  theme: t
}) => {
  if (risk === 'excellent' || risk === 'safe') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-2xl ${
        risk === 'critical' ? 'bg-red-500/10 border-red-500/20' : 'bg-orange-500/10 border-orange-500/20'
      } border flex items-center gap-4`}
    >
      <div className={`p-2 rounded-xl ${risk === 'critical' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>
        <ShieldAlert size={18} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[10px] font-black uppercase tracking-wider ${
            risk === 'critical' ? 'text-red-600' : 'text-orange-600'
          }`}>
            AI Risk Assessment: {risk}
          </span>
          <TrendingDown size={12} className={risk === 'critical' ? 'text-red-500' : 'text-orange-500'} />
        </div>
        <p className={`text-xs font-medium ${t.text}`}>
          Your attendance is at <span className="font-black">{percentage.toFixed(1)}%</span>. 
          You need to attend <span className="font-black underline">{needed}</span> more lectures to reach 75%.
        </p>
      </div>
      <div className={`hidden sm:flex flex-col items-end ${t.muted}`}>
        <p className="text-[10px] font-black uppercase">Goal</p>
        <div className="flex items-center gap-1 text-sm font-black">
          <Target size={14} className="text-primary" />
          75%
        </div>
      </div>
    </motion.div>
  );
};
