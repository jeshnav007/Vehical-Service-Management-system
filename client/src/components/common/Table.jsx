import React from 'react';

const Table = ({ headers, children, className = "" }) => {
  return (
    <div className={`overflow-x-auto custom-scrollbar ${className}`}>
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-4">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm font-medium">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow = ({ children, className = "" }) => (
  <tr className={`bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors duration-200 group ${className}`}>
    {children}
  </tr>
);

export const TableCell = ({ children, className = "" }) => (
  <td className={`px-6 py-4 first:rounded-l-xl last:rounded-r-xl border-y border-slate-100 dark:border-slate-800 first:border-l last:border-r ${className}`}>
    {children}
  </td>
);

export default Table;
