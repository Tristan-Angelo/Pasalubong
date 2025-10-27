import React from 'react';

const AnalyticsChart = ({ title, data, type = 'bar', color = 'rose' }) => {
  const colorClasses = {
    rose: 'bg-rose-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500'
  };

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="card p-6 hover-animate reveal">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      {type === 'bar' && (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700 truncate flex-1 mr-2" title={item.label}>{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.value}</span>
                  {item.revenue !== undefined && (
                    <span className="text-xs text-gray-500">(₱{item.revenue.toLocaleString()})</span>
                  )}
                  {item.sales !== undefined && item.sales > 0 && (
                    <span className="text-xs text-gray-500">({item.sales} sold)</span>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${colorClasses[color]} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {type === 'pie' && (
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            {/* Simple pie chart representation */}
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {data.reduce((acc, item, index) => {
                const total = data.reduce((sum, d) => sum + d.value, 0);
                const percentage = (item.value / total) * 100;
                const offset = acc.offset;
                const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
                
                acc.elements.push(
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={colors[index % colors.length]}
                    strokeWidth="20"
                    strokeDasharray={`${percentage * 2.51} ${251 - percentage * 2.51}`}
                    strokeDashoffset={-offset * 2.51}
                  />
                );
                
                acc.offset += percentage;
                return acc;
              }, { elements: [], offset: 0 }).elements}
            </svg>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${colorClasses[color]}`}></div>
            <span className="text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsChart;