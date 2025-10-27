import React from 'react';

const ActivityLog = ({ activities, limit = 10 }) => {
  const getActivityIcon = (type) => {
    const icons = {
      order_created: '📦',
      order_updated: '✏️',
      product_added: '➕',
      product_updated: '🔄',
      user_registered: '👤',
      user_deleted: '🗑️',
      login: '🔐',
      logout: '🚪'
    };
    return icons[type] || '📋';
  };

  const getActivityColor = (type) => {
    const colors = {
      order_created: 'text-blue-600 bg-blue-50',
      order_updated: 'text-orange-600 bg-orange-50',
      product_added: 'text-green-600 bg-green-50',
      product_updated: 'text-yellow-600 bg-yellow-50',
      user_registered: 'text-purple-600 bg-purple-50',
      user_deleted: 'text-red-600 bg-red-50',
      login: 'text-teal-600 bg-teal-50',
      logout: 'text-gray-600 bg-gray-50'
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const displayActivities = activities.slice(0, limit);

  return (
    <div className="card p-6 hover-animate reveal">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      
      {displayActivities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-3xl mb-2">📊</p>
          <p className="text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg ${getActivityColor(activity.type)} flex items-center justify-center flex-shrink-0`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;