import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  onClick,
  className = '',
  disabled = false,
}) => {
  return (
    <div 
      className={`feature-card flex flex-col items-center gap-2 text-center ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
      } ${className}`}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="text-blue-500 text-2xl mb-1">{icon}</div>
      <h3 className="font-medium text-sm text-white">{title}</h3>
      {description && (
        <p className="text-gray-400 text-xs">{description}</p>
      )}
    </div>
  );
};

export default FeatureCard; 