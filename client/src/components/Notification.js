import React from 'react';

const Notification = ({ message, type }) => {
  return (
    <div className={`bg-${type}-500/10 border border-${type}-500 text-gray-600 dark:text-gray-100 px-4 py-3 rounded relative`} role="alert">
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default Notification;
