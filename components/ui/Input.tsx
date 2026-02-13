import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  const inputId = id || props.name;
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-2.5 bg-white text-gray-900 border rounded-xl shadow-sm 
        placeholder:text-gray-400
        focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 
        transition-all duration-200 ease-in-out
        ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'} 
        ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
};