import React from 'react';

interface WatermarkWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  opacity?: number;
  text?: string;
  subtext?: string;
  repeat?: boolean;
}

export const WatermarkWrapper: React.FC<WatermarkWrapperProps> = ({
  children,
  className = '',
  id,
}) => {
  return (
    <div id={id} className={`relative ${className}`}>
      {/* Actual Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
