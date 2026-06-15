import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  icon,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block mb-1 font-medium text-gray-700 text-sm">
          {label}
          {required && <span className="ml-1 text-rose-400">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2  border rounded-md transition-colors duration-200
            ${icon ? 'pl-10' : ''}
            ${type === 'password' ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-rose-400 focus:ring-rose-400'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            focus:outline-none focus:ring-2
          `}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="right-0 absolute inset-y-0 flex items-center pr-3"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-gray-400" />
            ) : (
              <Eye className="w-4 h-4 text-gray-400" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <div className="flex items-center mt-1 text-red-500 text-sm">
          <AlertCircle className="mr-1 w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default Input;