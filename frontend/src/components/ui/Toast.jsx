import React from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const Toast = {
  success: (message, options = {}) => {
    toast.custom((t) => (
      <div className={`bg-success/10 border border-success/50 text-success p-4 rounded-md flex items-center gap-3 animate-slide-up ${
        t.visible ? 'animate-fade-in' : 'animate-fade-out'
      }`}>
        <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    ), options);
  },

  error: (message, options = {}) => {
    toast.custom((t) => (
      <div className={`bg-danger/10 border border-danger/50 text-danger p-4 rounded-md flex items-center gap-3 animate-slide-up ${
        t.visible ? 'animate-fade-in' : 'animate-fade-out'
      }`}>
        <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    ), options);
  },

  info: (message, options = {}) => {
    toast.custom((t) => (
      <div className={`bg-primary/10 border border-primary/50 text-primary p-4 rounded-md flex items-center gap-3 animate-slide-up ${
        t.visible ? 'animate-fade-in' : 'animate-fade-out'
      }`}>
        <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    ), options);
  },
};

export default Toast;
