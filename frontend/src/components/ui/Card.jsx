import React from 'react';

export const Card = ({ 
  children, 
  className = '', 
  hover = true,
  ...props 
}) => {
  return (
    <div
      className={`bg-surface rounded-md p-6 shadow-card border border-slate-700/50 transition-all duration-200 ease-out ${
        hover ? 'hover:shadow-card-hover hover:border-slate-600' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
