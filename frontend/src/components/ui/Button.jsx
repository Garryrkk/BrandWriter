import React from 'react';

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  children, 
  className = '',
  ...props 
}) => {
  const baseStyles = 'font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-600 focus:ring-primary-500',
    secondary: 'bg-surface text-white border border-primary/20 hover:bg-slate-700 focus:ring-primary-500',
    ghost: 'text-primary hover:bg-primary/10 focus:ring-primary-500',
    danger: 'bg-danger text-white hover:bg-red-600 focus:ring-danger',
    success: 'bg-success text-white hover:bg-emerald-600 focus:ring-success',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-xs',
    md: 'px-4 py-2 text-base rounded-sm',
    lg: 'px-6 py-3 text-base rounded-md',
    xl: 'px-8 py-4 text-lg rounded-md',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
