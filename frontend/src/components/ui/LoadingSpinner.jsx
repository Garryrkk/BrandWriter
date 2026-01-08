import React from 'react';

export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  className = '',
  ...props 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colors = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    success: 'border-success',
    white: 'border-white',
  };

  return (
    <div
      className={`${sizes[size]} border-2 border-slate-700 ${colors[color]} border-t-current rounded-full animate-spin ${className}`}
      {...props}
    />
  );
};

export default LoadingSpinner;
