import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  asChild?: boolean;
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  loading = false,
  asChild = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 ' +
                    'focus:outline-none focus:ring-4 focus:ring-primary-500/20 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg ' +
             'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'bg-white/10 backdrop-blur-md border border-white/20 text-slate-700 hover:bg-white/20',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'text-slate-700 hover:bg-slate-100',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  const classes = cn(baseStyles, variants[variant], sizes[size], className);

  if (asChild && React.isValidElement(children)) {
    const childProps = children.props as any;
    return React.cloneElement(children, {
      ...childProps,
      className: cn(childProps.className, classes),
      ...(disabled && { 'aria-disabled': true }),
      ...props,
    });
  }

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent me-2" />
      )}
      {children}
    </button>
  );
}