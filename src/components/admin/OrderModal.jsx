import React, { useState, useEffect } from 'react';
import { getCustomers, getProducts } from '../../utils/api';

const OrderModal = ({ isOpen, onClose, onSave, editingOrder }) => {
  const [formData, setFormData] = useState({
    orderNumber: '',
    customer: '',
    customerId: '',
    amount: '',
    status: 'Pending',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    shippingAddress: '',
    paymentMethod: 'Cash on Delivery',
    items: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Fetch customers and products when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      loadProducts();
    }
  }, [isOpen]);

  // Load customers from MongoDB
  const loadCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const response = await getCustomers();
      if (response.success) {
        setCustomers(response.customers);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  // Load products from MongoDB
  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await getProducts();
      if (response.success) {
        setProducts(response.products);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (editingOrder) {
      setFormData({
        orderNumber: editingOrder.orderNumber || '',
        customer: editingOrder.customer || '',
        customerId: editingOrder.customerId || '',
        amount: editingOrder.amount || '',
        status: editingOrder.status || 'Pending',
        date: editingOrder.date ? new Date(editingOrder.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: editingOrder.notes || '',
        shippingAddress: editingOrder.shippingAddress || '',
        paymentMethod: editingOrder.paymentMethod || 'Cash on Delivery',
        items: editingOrder.items || []
      });
    } else {
      // Generate order number for new orders
      const generateOrderNumber = () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `ORD-${timestamp}-${random}`;
      };
      
      setFormData({
        orderNumber: generateOrderNumber(),
        customer: '',
        customerId: '',
        amount: '',
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        shippingAddress: '',
        paymentMethod: 'Cash on Delivery',
        items: []
      });
    }
    setErrors({});
    setShowCustomerDropdown(false);
    setSelectedProduct(null);
    setProductSearchTerm('');
    setProductQuantity(1);
    setShowProductDropdown(false);
  }, [editingOrder, isOpen]);

  // Calculate total amount whenever items change
  useEffect(() => {
    const total = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setFormData(prev => ({
      ...prev,
      amount: total
    }));
  }, [formData.items]);

  // Filter customers based on input
  useEffect(() => {
    if (formData.customer && !formData.customerId) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(formData.customer.toLowerCase()) ||
        customer.email.toLowerCase().includes(formData.customer.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers([]);
    }
  }, [formData.customer, formData.customerId, customers]);

  // Filter products based on search term
  useEffect(() => {
    if (productSearchTerm && !selectedProduct) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(productSearchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [productSearchTerm, selectedProduct, products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If customer name is being changed, clear the customerId and show dropdown
    if (name === 'customer') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        customerId: '' // Clear customer ID when manually typing
      }));
      setShowCustomerDropdown(true);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle customer selection from dropdown
  const handleCustomerSelect = (customer) => {
    setFormData(prev => ({
      ...prev,
      customer: customer.name,
      customerId: customer.id,
      shippingAddress: customer.address || ''
    }));
    setShowCustomerDropdown(false);
    
    // Clear customer error if exists
    if (errors.customer) {
      setErrors(prev => ({
        ...prev,
        customer: ''
      }));
    }
  };

  // Handle product selection from dropdown
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setProductSearchTerm(product.name);
    setShowProductDropdown(false);
    
    // Clear product error if exists
    if (errors.product) {
      setErrors(prev => ({
        ...prev,
        product: ''
      }));
    }
  };

  // Add product to order
  const handleAddProduct = () => {
    if (!selectedProduct) {
      setErrors(prev => ({ ...prev, product: 'Please select a product' }));
      return;
    }

    if (productQuantity <= 0) {
      setErrors(prev => ({ ...prev, quantity: 'Quantity must be greater than 0' }));
      return;
    }

    // Check if product already exists in items
    const existingItemIndex = formData.items.findIndex(item => item.productId === selectedProduct.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += productQuantity;
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
    } else {
      // Add new product
      const newItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productImage: selectedProduct.image,
        quantity: productQuantity,
        price: selectedProduct.price
      };
      
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }

    // Reset selection
    setSelectedProduct(null);
    setProductSearchTerm('');
    setProductQuantity(1);
    setErrors(prev => ({ ...prev, product: '', quantity: '' }));
  };

  // Remove product from order
  const handleRemoveProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Update product quantity
  const handleUpdateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) return;
    
    const updatedItems = [...formData.items];
    updatedItems[index].quantity = newQuantity;
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer.trim()) {
      newErrors.customer = 'Customer name is required';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Please add at least one product to the order';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
        customerId: formData.customerId || null
      };

      await onSave(orderData);
      onClose();
    } catch (error) {
      console.error('Save order error:', error);
      
      // Handle field-specific errors
      if (error.field) {
        setErrors(prev => ({
          ...prev,
          [error.field]: error.message
        }));
      } else {
        setErrors({ submit: error.message || 'Failed to save order' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const statusOptions = ['Pending', 'Processing', 'Out for Delivery', 'Completed', 'Cancelled'];
  const paymentMethods = ['Cash on Delivery', 'Credit Card', 'Debit Card', 'Palawan Pay', 'PayMaya', 'Bank Transfer'];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">
              {editingOrder ? 'Edit Order' : 'Create New Order'}
            </h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errors.submit}
            </div>
          )}

          <div className="space-y-4">
            {/* Order Number - Always show, read-only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Number
              </label>
              <input
                type="text"
                name="orderNumber"
                value={formData.orderNumber}
                readOnly
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-gray-600"
              />
              {!editingOrder && (
                <p className="mt-1 text-xs text-gray-500">Auto-generated order number</p>
              )}
            </div>

            {/* Customer Name with Autocomplete */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  onFocus={() => setShowCustomerDropdown(true)}
                  onBlur={() => {
                    // Delay to allow click on dropdown item
                    setTimeout(() => setShowCustomerDropdown(false), 200);
                  }}
                  className={`w-full px-3 py-2 rounded-xl border ${errors.customer ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-rose-500`}
                  placeholder="Start typing customer name..."
                  autoComplete="off"
                />
                {isLoadingCustomers && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Dropdown with customer suggestions */}
              {showCustomerDropdown && filteredCustomers.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => handleCustomerSelect(customer)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={customer.image} 
                          alt={customer.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                          <p className="text-xs text-gray-600 mt-1">{customer.address}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Show message when typing but no matches */}
              {showCustomerDropdown && formData.customer && filteredCustomers.length === 0 && !isLoadingCustomers && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg p-4 text-center text-gray-500 text-sm">
                  No customers found. You can still enter a custom name.
                </div>
              )}
              
              {errors.customer && (
                <p className="mt-1 text-sm text-red-500">{errors.customer}</p>
              )}
            </div>

            {/* Product Selection */}
            <div className="border border-gray-300 rounded-xl p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Order Items <span className="text-red-500">*</span>
              </label>
              
              {/* Add Product Section with Autocomplete */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={productSearchTerm}
                    onChange={(e) => {
                      setProductSearchTerm(e.target.value);
                      setSelectedProduct(null);
                      if (errors.product) {
                        setErrors(prev => ({ ...prev, product: '' }));
                      }
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    onBlur={() => {
                      // Delay to allow click on dropdown item
                      setTimeout(() => setShowProductDropdown(false), 200);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                    placeholder={isLoadingProducts ? 'Loading products...' : 'Search product by name, SKU, or category...'}
                    disabled={isLoadingProducts}
                    autoComplete="off"
                  />
                  
                  {isLoadingProducts && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}

                  {/* Product Dropdown with Images */}
                  {showProductDropdown && filteredProducts.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <img 
                              src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'} 
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
                              }}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{product.name}</p>
                              <p className="text-xs text-gray-500">SKU: {product.sku} • {product.category}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-semibold text-rose-600">₱{product.price}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                  Stock: {product.stock}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show message when typing but no matches */}
                  {showProductDropdown && productSearchTerm && filteredProducts.length === 0 && !isLoadingProducts && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg p-4 text-center text-gray-500 text-sm">
                      No products found matching "{productSearchTerm}"
                    </div>
                  )}
                </div>
                
                <input
                  type="number"
                  value={productQuantity}
                  onChange={(e) => {
                    setProductQuantity(parseInt(e.target.value) || 1);
                    if (errors.quantity) {
                      setErrors(prev => ({ ...prev, quantity: '' }));
                    }
                  }}
                  min="1"
                  className="w-20 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Qty"
                />
                
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors whitespace-nowrap"
                  disabled={!selectedProduct}
                >
                  + Add
                </button>
              </div>

              {errors.product && (
                <p className="mb-2 text-sm text-red-500">{errors.product}</p>
              )}
              {errors.quantity && (
                <p className="mb-2 text-sm text-red-500">{errors.quantity}</p>
              )}

              {/* Order Items List */}
              {formData.items.length > 0 ? (
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                      {/* Product Image */}
                      <img 
                        src={item.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'} 
                        alt={item.productName}
                        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
                        }}
                      />
                      
                      {/* Product Info */}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.productName}</p>
                        <p className="text-sm text-gray-600">₱{item.price.toFixed(2)} each</p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Subtotal */}
                      <div className="text-right min-w-[80px]">
                        <p className="font-semibold text-gray-800">₱{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(index)}
                        className="p-2 hover:bg-red-100 rounded text-red-600 transition-colors"
                        title="Remove item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  
                  {/* Total */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                    <span className="font-semibold text-gray-800">Total Amount:</span>
                    <span className="text-xl font-bold text-rose-600">₱{formData.amount.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 bg-white rounded-lg border border-gray-200">
                  No items added yet. Select a product above to add to the order.
                </div>
              )}

              {errors.items && (
                <p className="mt-2 text-sm text-red-500">{errors.items}</p>
              )}
            </div>

            {/* Status */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-xl border ${errors.status ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-rose-500`}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-500">{errors.status}</p>
              )}
            </div>

            {/* Date and Payment Method */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-xl border ${errors.date ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-rose-500`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping Address
              </label>
              <input
                type="text"
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Enter shipping address"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                placeholder="Add any notes about this order..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingOrder ? 'Update Order' : 'Create Order')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;