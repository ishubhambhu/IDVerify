import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';

interface DateInputProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  required?: boolean;
  name?: string;
  error?: string;
}

export const DateInput: React.FC<DateInputProps> = ({ label, value, onChange, required, name, error }) => {
  const [displayValue, setDisplayValue] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Sync internal display value when prop changes (YYYY-MM-DD -> DD-MM-YYYY)
  useEffect(() => {
    if (value) {
      const [year, month, day] = value.split('-');
      if (year && month && day) {
        setDisplayValue(`${day}-${month}-${year}`);
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const formatDisplayValue = (val: string) => {
    // Remove non-digit characters
    const digits = val.replace(/\D/g, '');
    
    // Auto-insert hyphens
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
    }
    if (digits.length > 4) {
      formatted = `${formatted.slice(0, 5)}-${formatted.slice(5, 9)}`;
    }
    return formatted;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    
    // Allow deleting specifically to avoid getting stuck
    if (newVal.length < displayValue.length) {
      setDisplayValue(newVal);
      if (newVal === '') onChange('');
      return;
    }

    const formatted = formatDisplayValue(newVal);
    
    // Limit length to DD-MM-YYYY (10 chars)
    if (formatted.length <= 10) {
      setDisplayValue(formatted);
      
      // If complete, update parent
      if (formatted.length === 10) {
        const [day, month, year] = formatted.split('-');
        // Basic validation
        if (parseInt(month) > 0 && parseInt(month) <= 12 && parseInt(day) > 0 && parseInt(day) <= 31) {
             onChange(`${year}-${month}-${day}`);
        }
      }
    }
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          placeholder="DD-MM-YYYY"
          value={displayValue}
          onChange={handleTextChange}
          className={`w-full px-4 py-2.5 bg-white text-gray-900 border rounded-xl shadow-sm 
            placeholder:text-gray-400
            focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 
            transition-all duration-200 ease-in-out pl-10
            ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-200'}`}
          required={required}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => dateInputRef.current?.showPicker()}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <Calendar size={18} />
        </button>
        
        {/* Hidden Native Picker */}
        <input
          ref={dateInputRef}
          type="date"
          name={name}
          value={value}
          onChange={handleDateSelect}
          className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
          tabIndex={-1}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
};
