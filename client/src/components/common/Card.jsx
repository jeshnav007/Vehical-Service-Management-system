import React from 'react';

const Card = ({ children, title, subtitle, extra, className = "", noPadding = false }) => {
  return (
    <div className={`glass-card hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group ${className}`}>
      {/* Background Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
      
      {(title || subtitle || extra) && (
        <div className="mb-6 relative z-10 flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">{subtitle}</p>}
          </div>
          {extra && <div className="flex-shrink-0">{extra}</div>}
        </div>
      )}
      
      <div className={`relative z-10 ${noPadding ? '-mx-6 -mb-6 mt-2' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
