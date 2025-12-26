import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(...inputs));
}

export function Button({
  children,
  type,
  className,
  ...props
}: React.PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={cn('bg-primary-900 w-50 h-10 text-white rounded', className)}
      type={type ?? 'button'}
      {...props}
    >
      {children}
    </button>
  );
}
