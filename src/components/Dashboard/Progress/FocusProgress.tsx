import React, { useEffect, useState, useRef } from 'react';
import { useGoals } from '../../../context/GoalContext';
import { Target } from 'lucide-react';

const FocusProgress: React.FC = () => {
  const { goals } = useGoals();
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const prevCompletedCountRef = useRef<number>(0);
  
  // Filter focused goals
  const focusedGoals = goals.filter(goal => goal.isFocused);
  const completedFocusedGoals = focusedGoals.filter(goal => goal.completedAt !== null);
  
  // Calculate completion percentage
  const totalFocused = focusedGoals.length;
  const totalCompleted = completedFocusedGoals.length;
  const progressPercentage = totalFocused > 0 ? (totalCompleted / totalFocused) * 100 : 0;
  
  // Reset animation if no focused goals
  useEffect(() => {
    if (totalFocused === 0) {
      setAnimatedProgress(0);
    }
  }, [totalFocused]);
  
  // Animate the progress when completed count changes
  useEffect(() => {
    // Clear any existing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    const start = animatedProgress;
    const end = progressPercentage;
    const duration = 800; // Animation duration in ms
    const startTime = performance.now();
    
    // Only animate if the value is actually changing
    if (start !== end) {
      const animateProgress = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Use easeOutQuad easing function for smooth animation
        const easeProgress = progress * (2 - progress);
        const currentValue = start + (end - start) * easeProgress;
        
        setAnimatedProgress(currentValue);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateProgress);
        } else {
          // Ensure we land exactly on the target percentage
          setAnimatedProgress(end);
          animationRef.current = null;
        }
      };
      
      animationRef.current = requestAnimationFrame(animateProgress);
    }
    
    // Cleanup animation on unmount
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [progressPercentage, totalCompleted]); // Add totalCompleted as a dependency to ensure updates

  // Store the previous completed count for comparison
  useEffect(() => {
    prevCompletedCountRef.current = totalCompleted;
  }, [totalCompleted]);
  
  // If no focused goals, return null
  if (totalFocused === 0) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-3 dark:bg-gray-800/30 backdrop-blur-sm p-5 px-5 rounded-lg h-12 md:h-12">
      <Target size={20} className="text-white dark:text-white flex-shrink-0" />
      
      <div className="flex flex-col flex-grow justify-center">
        <div className="flex justify-between text-xs md:text-sm text-white dark:text-white font-medium">
          <span>Focus Goals</span>
          <span className="font-semibold">{totalCompleted}/{totalFocused}</span>
        </div>
        
        <div className="h-2 md:h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-1.5">
          <div 
            className="h-full bg-gradient-to-r from-primary-light to-red-500 dark:from-primary-dark dark:to-red-400 rounded-full transition-all duration-300 ease-out"
            style={{ 
              width: `${Math.max(0, animatedProgress)}%`, // Ensure width is never negative
              boxShadow: animatedProgress > 10 ? '0 0 8px rgba(239, 68, 68, 0.5)' : 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FocusProgress; 