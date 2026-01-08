import React from 'react';

export const Skeleton = ({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '',
  count = 1,
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${width} ${height} bg-slate-700/50 rounded-md animate-pulse ${className}`}
          {...props}
        />
      ))}
    </div>
  );
};

export default Skeleton;
