import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const styles = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] hover:shadow-lg focus:ring-[var(--color-primary)]",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 hover:shadow-sm focus:ring-gray-500",
    outline: "border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:ring-[var(--color-primary)]",
    danger: "bg-[var(--color-danger)] text-white hover:bg-red-600 hover:shadow-lg focus:ring-red-500",
  };

  return (
    <button className={`${baseStyle} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
