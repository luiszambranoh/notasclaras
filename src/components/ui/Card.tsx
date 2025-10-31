"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  const baseClasses = "bg-white rounded-lg shadow-sm border border-gray-200";
  const clickableClasses = onClick ? "cursor-pointer hover:shadow-md transition-shadow" : "";
  const combinedClasses = `${baseClasses} ${clickableClasses} ${className}`.trim();

  if (onClick) {
    return (
      <div className={combinedClasses} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}