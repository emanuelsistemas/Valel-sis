import React from 'react';
import { GitBranch } from 'lucide-react';

interface LogoProps {
  className?: string;
  isExpanded?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', isExpanded = true }) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <GitBranch className="h-10 w-10 text-white" />
      {isExpanded && (
        <span 
          className="text-white text-2xl -ml-1 -mb-3" 
          style={{ fontFamily: 'MuseoModerno' }}
        >
          ale-sis
        </span>
      )}
    </div>
  );
};

export default Logo;