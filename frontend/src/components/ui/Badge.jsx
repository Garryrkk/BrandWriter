import React from 'react';

export const Badge = ({ 
  variant = 'default', 
  children, 
  className = '',
  ...props 
}) => {
  const variants = {
    default: 'bg-primary/10 text-primary border border-primary/20',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    danger: 'bg-danger/10 text-danger border border-danger/20',
    secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-pill text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
