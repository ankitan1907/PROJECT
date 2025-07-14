import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;  // add onClick here
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footer,
  actions,
  onClick,  // receive onClick
}) => {
  return (
    <div
      onClick={onClick}   // forward onClick to div
      className={`bg-white rounded-lg shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden ${className}`}
      style={{ cursor: onClick ? 'pointer' : 'default' }} // optional cursor pointer when clickable
    >
      {title && (
        <div className={`px-6 py-4 border-b flex justify-between items-center ${headerClassName}`}>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
      {footer && <div className="px-6 py-4 bg-gray-50 border-t">{footer}</div>}
    </div>
  );
};

export default Card;
