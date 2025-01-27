import React, { useEffect, useState } from 'react';

type CircularProgressBarProps = {
  progress: number; // Progress percentage (0 to 100)
  size?: number; // Size of the circle
};

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({ progress, size = 100 }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - 10) / 2; // Adjust for stroke width
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Animate progress on mount
    const animationDuration = 1000; // Duration in milliseconds
    const stepTime = 10; // Time between each step in milliseconds
    const totalSteps = animationDuration / stepTime;
    const stepProgress = progress / totalSteps;

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += stepProgress;
      if (currentProgress >= progress) {
        currentProgress = progress;
        clearInterval(interval);
      }
      setAnimatedProgress(currentProgress);
    }, stepTime);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [progress]);

  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <svg width={size} height={size}>
      <circle
        stroke="#e6e6e6" // Background circle color
        fill="transparent"
        strokeWidth="10"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="#3B82F6" // Progress circle color
        fill="transparent"
        strokeWidth="10"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }} // Animation
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        stroke="#3B82F6"
        strokeWidth="1px"
        dy=".3em"
        fontSize="20"
        fill="#3B82F6"
      >
        {Math.round(animatedProgress)}%
      </text>
    </svg>
  );
};

export default CircularProgressBar; 