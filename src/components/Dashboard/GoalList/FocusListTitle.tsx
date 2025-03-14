import React from 'react';
import { Star } from 'lucide-react';

interface FocusListTitleProps {
  title: string;
  goalCount: number;
}

const FocusListTitle: React.FC<FocusListTitleProps> = ({ title, goalCount }) => {
  return (
    <div className="flex items-center justify-between mb-4 px-4 pt-2">
      <div className="flex items-center gap-2">
        <Star size={24} className="text-blue-500 fill-blue-500/20" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          {title}
          <span className="ml-3 text-base font-normal text-blue-400/60">
            {goalCount} {goalCount === 1 ? 'goal' : 'goals'}
          </span>
        </h2>
      </div>
    </div>
  );
};

export default FocusListTitle; 