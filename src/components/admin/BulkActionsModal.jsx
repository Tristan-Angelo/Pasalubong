import React, { useState } from 'react';

const BulkActionsModal = ({ isOpen, onClose, selectedItems, itemType, onBulkAction }) => {
  const [action, setAction] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkAction = async () => {
    if (!action) return;

    setIsProcessing(true);
    try {
      await onBulkAction(action, selectedItems, newStatus);
      onClose();
    } catch (error) {
      console.error('Bulk action error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const getActions = () => {
    switch (itemType) {
      case 'orders':
        return [
          { value: 'update_status', label: 'Update Status' },
          { value: 'delete', label: 'Delete Orders' },
          { value: 'export', label: 'Export to CSV' }
        ];
      case 'products':
        return [
          { value: 'update_stock', label: 'Update Stock' },
          { value: 'update_price', label: 'Update Price' },
          { value: 'delete', label: 'Delete Products' },
          { value: 'export', label: 'Export to CSV' }
        ];
      case 'users':
        return [
          { value: 'export', label: 'Export to CSV' },
          { value: 'delete', label: 'Delete Users' }
        ];
      default:
        return [];
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Bulk Actions</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Selected: <span className="font-semibold">{selectedItems.length}</span> {itemType}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Action
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border outline-none"
            >
              <option value="">Choose an action...</option>
              {getActions().map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>

          {action === 'update_status' && itemType === 'orders' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border outline-none"
              >
                <option value="">Select status...</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {action === 'delete' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                ⚠️ Warning: This action cannot be undone. Are you sure you want to delete {selectedItems.length} {itemType}?
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleBulkAction}
            disabled={!action || isProcessing || (action === 'update_status' && !newStatus)}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing && (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {isProcessing ? 'Processing...' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsModal;