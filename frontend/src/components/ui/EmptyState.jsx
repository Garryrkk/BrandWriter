import React from 'react';

export const EmptyState = ({ 
  icon: Icon,
  title = 'No items found',
  description = 'Get started by creating your first item',
  action = null,
  className = '',
  ...props 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`} {...props}>
      {Icon && (
        <Icon className="w-16 h-16 text-slate-600 mb-4" />
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-6 max-w-md text-center">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;
