import React from 'react';

const Loader = ({ className = "h-8 w-8", text }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4">
      <div className={`animate-spin ${className} border-4 border-primary border-t-transparent rounded-full`} />
      {text && <p className="text-sm font-semibold text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
};

export default Loader;
