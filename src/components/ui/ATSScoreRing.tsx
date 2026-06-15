import React, { useEffect, useState } from 'react';

interface ATSScoreRingProps {
  score: number;
  size?: 'small' | 'large';
}

export default function ATSScoreRing({ score, size = 'small' }: ATSScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);

  // Animate the score counting up from 0 to target score when mounted or when target score changes
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000; // 1 second animation duration

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Calculate current frame value
      setDisplayScore(Math.floor(progress * score));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animFrame);
  }, [score]);

  // Determine color based on threshold
  let strokeColor = '#ef4444'; // Red if < 50
  let textColorClass = 'text-red-500';
  let bgColorClass = 'bg-red-50 text-red-700 border-red-200';
  
  if (score >= 50 && score <= 75) {
    strokeColor = '#f59e0b'; // Amber if 50-75
    textColorClass = 'text-amber-500';
    bgColorClass = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (score > 75) {
    strokeColor = '#10b981'; // Emerald if > 75
    textColorClass = 'text-emerald-500';
    bgColorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  const isLarge = size === 'large';
  const diameter = isLarge ? 140 : 44;
  const strokeWidth = isLarge ? 10 : 4;
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate offset using displayScore for perfect scroll-sync with count-up text
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: diameter, height: diameter }}
    >
      {/* Outer subtle glow ring for geometric balance representation */}
      {isLarge && (
        <div className="absolute inset-0 rounded-full bg-slate-50 border border-slate-150 -m-1 pointer-events-none" />
      )}
      
      <svg width={diameter} height={diameter} className="transform -rotate-90 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.03)]">
        {/* Background track circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="transparent"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />
        {/* Active glowing progress circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-75 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className="font-extrabold font-mono tracking-tight"
          style={{
            fontSize: isLarge ? '32px' : '13px',
            color: '#0f172a',
            lineHeight: 1,
          }}
        >
          {displayScore}
        </span>
        {isLarge && (
          <span className="text-[10px] text-[#64748b] font-bold tracking-widest uppercase mt-1">
            % Match
          </span>
        )}
      </div>
    </div>
  );
}
