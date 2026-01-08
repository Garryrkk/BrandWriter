import React from 'react';

export const Input = ({ 
  error = false, 
  success = false, 
  size = 'md', 
  label = '',
  helperText = '',
  className = '',
  ...props 
}) => {
  const baseStyles = 'w-full font-sans transition-all duration-200 focus:outline-none focus:ring-2 bg-slate-700/30 border';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded-xs',
    md: 'px-4 py-2 text-base rounded-sm',
    lg: 'px-5 py-3 text-base rounded-md',
  };

  const borderStyles = error 
    ? 'border-danger focus:ring-danger'
    : success
    ? 'border-success focus:ring-success'
    : 'border-slate-600/50 focus:ring-primary-500';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-200 mb-2">
          {label}
        </label>
      )}
      <input
        className={`${baseStyles} ${sizeStyles[size]} ${borderStyles} ${className}`}
        {...props}
      />
      {helperText && (
        <p className={`text-xs mt-1 ${error ? 'text-danger' : success ? 'text-success' : 'text-slate-400'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
