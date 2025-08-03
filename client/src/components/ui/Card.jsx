import React from 'react';
import clsx from 'clsx';

const Card = ({
  children,
  className = '',
  shadow = 'shadow-lg',
  padding = 'p-6',
  rounded = 'rounded-2xl',
  bg = 'bg-white dark:bg-gray-800',
  border = 'border border-gray-200 dark:border-gray-700',
}) => {
  return (
    <div
      className={clsx(
        `transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-2xl
         ${bg} ${padding} ${rounded} ${shadow} ${border} ${className}`
      )}
    >
      {children}
    </div>
  );
};

export default Card;
