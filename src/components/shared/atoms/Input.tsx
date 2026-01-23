import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 transition-all duration-200 outline-none
          ${error
            ? "border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30"
            : "border-gray-200 dark:border-neutral-800 focus:border-red-500 focus:ring-red-50 dark:focus:ring-red-900/20 hover:border-gray-300 dark:hover:border-neutral-700"
          }
          ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";