import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  error,
  icon,
  showPasswordToggle = false,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-[#c9d1d9]">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#8b949e]">
            {icon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full rounded-md 
            ${icon ? 'pl-10' : 'pl-3'} 
            ${showPasswordToggle ? 'pr-10' : 'pr-3'} 
            py-2
            bg-[#0d1117] 
            border ${error ? 'border-[#f85149]' : 'border-[#30363d]'} 
            text-[#c9d1d9]
            placeholder-[#8b949e]
            focus:outline-none focus:ring-1 focus:ring-[#58a6ff] focus:border-[#58a6ff]
            transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#8b949e] hover:text-[#c9d1d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={togglePasswordVisibility}
            disabled={disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-[#f85149] text-xs mt-1">{error}</p>}
    </div>
  );
};

export default InputField;