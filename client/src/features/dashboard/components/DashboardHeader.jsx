import React from 'react';

const DashboardHeader = ({ greeting = "Good morning", userName = "Sarah" }) => {
  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
          {greeting}, {userName}
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Here is what requires your attention today, {currentDate}.
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;
