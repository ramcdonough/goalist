import React from 'react';

interface ProgressMeterProps {
  title: string;
  progress: number;
}

const ProgressMeter: React.FC<ProgressMeterProps> = ({ title, progress }) => {
  const roundedProgress = Math.round(progress);

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-lg p-4 hover:border-gray-300 hover:dark:border-gray-500 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out">
      <h3 className=" font-medium text-text-light dark:text-text-dark mb-2">{title}</h3>
      <div className="group relative">
        <div className="flex items-center justify-between mb-2">
          <div className="text-right">
            <span className="text-xl font-semibold text-text-light dark:text-text-dark">
              {roundedProgress}%
            </span>
          </div>
        </div>
        <div className="flex h-2 overflow-hidden bg-gray-200 dark:bg-gray-700 rounded">
          <div
            style={{ width: `${roundedProgress}%` }}
            className="bg-gradient-to-r from-primary to-blue-800 transition-all duration-500 ease-out"
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressMeter; 