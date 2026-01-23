import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const Button: React.FC<ButtonProps> = ({ variant = "primary", children, ...props }) => {
  const base = "px-8 py-1 rounded-full font-medium transition-all";
  const styles = variant === "primary" ? "bg-red-600 text-white hover:bg-red-800 dark:hover:bg-red-700" : "bg-white dark:bg-transparent text-red-600 dark:text-red-500 border border-red-600 dark:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30";
  return (
    <button className={`${base} ${styles}`} {...props}>
      {children}
    </button>
  );
};