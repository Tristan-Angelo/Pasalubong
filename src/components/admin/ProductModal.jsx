import React, { useState, useEffect } from 'react';
import { uploadProductImage, uploadProductImages, uploadSellerProductImage, uploadSellerProductImages } from '../../utils/api';

const ProductModal = ({ isOpen, onClose, onSave, editingProduct, userType = 'admin' }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    seller: '',
    description: '',
    image: '',
    images: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      const existingImages = editingProduct.images || (editingProduct.image ? [editingProduct.image] : []);
      setFormData({
        name: editingProduct.name || '',
        category: editingProduct.category || '',
        price: editingProduct.price || '',
        stock: editingProduct.stock || '',
        seller: editingProduct.seller || '',
        description: editingProduct.description || '',
        image: editingProduct.image || '',
        images: existingImages
      });
      setImagePreviews(existingImages);
    } else {
      setFormData({
        name: '',
        category: '',
        price: '',
        stock: '',
        seller: '',
        description: '',
        image: '',
        images: []
      });
      setImagePreviews([]);
    }
    setErrors({});
    setImageFiles([]);
  }, [editingProduct, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (imagePreviews.length + files.length > 4) {
      setErrors(prev => ({
        ...prev,
        image: 'Maximum 4 images allowed'
      }));
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validFiles = [];
    const newPreviews = [];

    for (const file of files) {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          image: 'Only image files are allowed (jpeg, jpg, png, gif, webp)'
        }));
        continue;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'Image size must be less than 5MB'
        }));
        continue;
      }

      validFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === validFiles.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    if (validFiles.length > 0) {
      setImageFiles(prev => [...prev, ...validFiles]);
      
      // Clear error
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: ''
        }));
      }
    }
  };

  const handleRemoveImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    
    // Also update formData.images if it's an existing image
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (formData.stock === '' || formData.stock < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }
    if (userType === 'admin' && !formData.seller.trim()) {
      newErrors.seller = 'Seller name is required';
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
      let uploadedImages = [...imagePreviews];

      // Upload new images if any files are selected
      if (imageFiles.length > 0) {
        setIsUploading(true);
        try {
          // Use batch upload for multiple images - choose API based on user type
          const uploadResponse = userType === 'seller' 
            ? await uploadSellerProductImages(imageFiles)
            : await uploadProductImages(imageFiles);
          
          // Get the uploaded image paths
          const newUploadedPaths = uploadResponse.imagePaths;
          
          // Keep existing images (non-preview URLs) and add new uploaded ones
          const existingImages = imagePreviews.filter(preview => !preview.startsWith('data:'));
          uploadedImages = [...existingImages, ...newUploadedPaths];
        } catch (uploadError) {
          setErrors({ image: uploadError.message || 'Failed to upload images' });
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      // Ensure at least one image
      if (uploadedImages.length === 0) {
        uploadedImages = ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'];
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        image: uploadedImages[0], // First image as primary
        images: uploadedImages // All images
      };

      await onSave(productData);
      onClose();
    } catch (error) {
      if (error.field) {
        setErrors(prev => ({
          ...prev,
          [error.field]: error.message
        }));
      } else {
        setErrors({ general: error.message || 'Failed to save product' });
      }
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={isSubmitting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {editingProduct && editingProduct.sku && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">SKU:</span> <span className="font-mono text-gray-800">{editingProduct.sku}</span>
              </p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-300'} outline-none focus:border-rose-500`}
                placeholder="Ube Halaya"
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-xl border ${errors.category ? 'border-red-500' : 'border-gray-300'} outline-none focus:border-rose-500`}
                disabled={isSubmitting}
              >
                <option value="">Select Category</option>
                <option value="Sweets">Sweets</option>
                <option value="Snacks">Snacks</option>
                <option value="Beverages">Beverages</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₱) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-xl border ${errors.price ? 'border-red-500' : 'border-gray-300'} outline-none focus:border-rose-500`}
                placeholder="250"
                min="0"
                step="0.01"
                disabled={isSubmitting}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-xl border ${errors.stock ? 'border-red-500' : 'border-gray-300'} outline-none focus:border-rose-500`}
                placeholder="15"
                min="0"
                disabled={isSubmitting}
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>

            {userType === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seller <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="seller"
                  value={formData.seller}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-xl border ${errors.seller ? 'border-red-500' : 'border-gray-300'} outline-none focus:border-rose-500`}
                  placeholder="Maria's Store"
                  disabled={isSubmitting}
                />
                {errors.seller && <p className="text-red-500 text-xs mt-1">{errors.seller}</p>}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 outline-none focus:border-rose-500"
              placeholder="Traditional Filipino purple yam dessert"
              rows="3"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Images <span className="text-gray-500 text-xs">(Max 4 images)</span>
            </label>
            
            {/* Image Previews Grid */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-32 object-cover rounded-xl border border-gray-300"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {index === 0 ? 'Primary' : `Image ${index + 1}`}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isSubmitting}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button - Show if less than 4 images */}
            {imagePreviews.length < 4 && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isSubmitting}
                  multiple
                />
                <label 
                  htmlFor="image-upload" 
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600">Click to upload images</span>
                  <span className="text-xs text-gray-500 mt-1">
                    {imagePreviews.length > 0 
                      ? `${4 - imagePreviews.length} more image${4 - imagePreviews.length > 1 ? 's' : ''} allowed`
                      : 'PNG, JPG, GIF, WEBP up to 5MB each'
                    }
                  </span>
                </label>
              </div>
            )}
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 bg-white border hover:bg-gray-50 py-2 px-4 rounded-lg"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || isUploading}
            >
              {isUploading ? 'Uploading Images...' : isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;