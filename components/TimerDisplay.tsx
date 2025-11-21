import React from 'react';
import { TimerMode } from '../types';
import { MODE_COLORS } from '../constants';

interface TimerDisplayProps {
  timeLeft: number;
  totalTime: number;
  mode: TimerMode;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, totalTime, mode }) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // SVG Circle calculations
  // We define a coordinate system of 240x240
  const radius = 120;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (timeLeft / totalTime) * circumference;

  return (
    <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
      {/* Background Circle */}
      <div className={`absolute w-full h-full rounded-full border-4 border-doodle-black ${MODE_COLORS[mode]} opacity-20 transform scale-95 translate-y-1`}></div>
      
      <svg
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        className="w-full h-full transform -rotate-90 relative z-10"
      >
        <circle
          stroke="#e5e5e5"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#2c2c2c"
          fill="white"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s linear' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      
      <div className="absolute z-20 flex flex-col items-center">
        <span className="text-5xl sm:text-6xl font-bold text-doodle-black tracking-widest">
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
};

export default TimerDisplay;