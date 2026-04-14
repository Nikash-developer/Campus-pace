// Campus Pace - Ultimate Force Update - 2026-04-11
// Campus Pace - Global Synchronization & Stabilization Update - 2026-04-11
// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface WhatIfSimulatorProps {
  currentAttended: number;
  currentConducted: number;
  totalPlanned: number;
  subjectName: string;
  theme: any;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  currentAttended,
  currentConducted,
  totalPlanned,
  subjectName,
  theme: t
}) => {
  const [extraLectures, setExtraLectures] = useState(0);
  const [willBePresent, setWillBePresent] = useState(0);

  const remaining = totalPlanned - currentConducted;
  const simulatedTotal = currentConducted + extraLectures;
  const simulatedAttended = currentAttended + willBePresent;
  const simulatedPercentage = simulatedTotal > 0 ? (simulatedAttended / simulatedTotal) * 100 : 100;
  
  const isSafe = simulatedPercentage >= 75;

  return (
    <div className={`p-6 rounded-[2rem] ${t.card} border ${t.border} shadow-sm`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-xl ${t.accentBg} ${t.accent}`}>
          <Calculator size={20} />
        </div>
        <div>
          <h3 className={`font-black ${t.heading}`}>Attendance Simulator</h3>
          <p className={`text-[10px] uppercase tracking-wider ${t.muted}`}>{subjectName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block">
              <span className={`text-xs font-bold ${t.muted} mb-2 block`}>Next {remaining} Lectures</span>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, remaining)}
                  value={extraLectures}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setExtraLectures(val);
                    if (willBePresent > val) setWillBePresent(val);
                  }}
                  className="flex-1 accent-primary"
                />
                <span className={`text-sm font-black ${t.heading} w-8`}>{extraLectures}</span>
              </div>
              <p className={`text-[10px] ${t.muted} mt-1 italic`}>Simulating {extraLectures} more lectures being conducted.</p>
            </label>

            <label className="block">
              <span className={`text-xs font-bold ${t.muted} mb-2 block`}>How many will you attend?</span>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max={extraLectures}
                  value={willBePresent}
                  onChange={(e) => setWillBePresent(parseInt(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className={`text-sm font-black ${t.heading} w-8`}>{willBePresent}</span>
              </div>
            </label>
          </div>

          <div className={`p-4 rounded-2xl ${isSafe ? 'bg-green-500/5 text-green-600' : 'bg-red-500/5 text-red-600'} border border-current/10 flex items-start gap-3`}>
            {isSafe ? <CheckCircle2 size={18} className="mt-0.5" /> : <AlertCircle size={18} className="mt-0.5" />}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1">Prediction</p>
              <p className="text-xs font-medium leading-relaxed">
                If you attend {willBePresent} out of the next {extraLectures} lectures, your attendance will be{' '}
                <span className="font-black underline">{simulatedPercentage.toFixed(1)}%</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="w-40 h-40">
            <CircularProgressbar
              value={simulatedPercentage}
              text={`${simulatedPercentage.toFixed(0)}%`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: isSafe ? '#22C55E' : '#EF4444',
                textColor: isSafe ? '#22C55E' : '#EF4444',
                trailColor: t.bg === 'bg-[#0f172a]' ? '#1e293b' : '#f1f5f9',
                strokeLinecap: 'round',
                pathTransitionDuration: 0.5,
              })}
            />
          </div>
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-4 ${isSafe ? 'text-green-500' : 'text-red-500'}`}>
            {isSafe ? 'Safe Zone' : 'Defaulter Zone'}
          </p>
        </div>
      </div>
    </div>
  );
};
