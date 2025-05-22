import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  disabled = false,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-md focus:outline-none transition-colors duration-200 flex items-center justify-center';
  
  const variantClasses = {
    primary: `bg-[#238636] hover:bg-[#2ea043] text-white ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-[#238636]' : ''}`,
    secondary: `bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-[#21262d]' : ''}`,
    outline: `bg-transparent hover:bg-[#21262d] text-[#c9d1d9] border border-[#30363d] ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''}`
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;
  
  return (
    <button className={combinedClasses} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default Button;