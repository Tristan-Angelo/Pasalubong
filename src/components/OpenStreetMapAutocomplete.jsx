import React, { useState, useEffect, useRef } from 'react';

const OpenStreetMapAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = 'Start typing address...', 
  label,
  required = false,
  disabled = false,
  className = '',
  onSelectAddress = null // Callback when full address is selected
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Add Philippines to the query for better results
      const searchQuery = `${query}, Philippines`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=jsonv2&addressdetails=1&limit=10`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'PasalubongApp/1.0' // Required by Nominatim usage policy
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      
      // Format the results
      const formattedSuggestions = data.map(item => {
        // Extract barangay from multiple possible sources
        let barangay = '';
        
        // First try the address object
        if (item.address) {
          barangay = item.address.suburb || 
                     item.address.neighbourhood || 
                     item.address.village || 
                     item.address.hamlet || '';
        }
        
        // If not found in address, try the name field (as per API response example)
        if (!barangay && item.name) {
          // Check if the name looks like a barangay (contains common barangay patterns)
          const name = item.name;
          if (name.includes('Barangay') || 
              name.includes('Hills') || 
              name.includes('Street') ||
              name.includes('Creek') ||
              (item.category === 'highway' && item.type === 'residential')) {
            barangay = name;
          }
        }
        
        return {
          value: item.display_name,
          label: item.display_name,
          data: {
            lat: item.lat,
            lon: item.lon,
            address: item.address || {},
            placeId: item.place_id,
            type: item.type,
            category: item.category,
            boundingbox: item.boundingbox,
            name: item.name || '',
            // Extract useful address components
            street: item.address?.road || item.address?.street || '',
            barangay: barangay,
            city: item.address?.city || item.address?.municipality || item.address?.town || '',
            province: item.address?.province || item.address?.state || '',
            region: item.address?.region || '',
            postalCode: item.address?.postcode || '',
            country: item.address?.country || 'Philippines'
          }
        };
      });

      setSuggestions(formattedSuggestions);
      setShowSuggestions(formattedSuggestions.length > 0);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce the API call
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 500);

    // Call onChange with the raw input value
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.value);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    
    if (onChange) {
      onChange(suggestion.value);
    }

    // Call the onSelectAddress callback with full address data
    if (onSelectAddress) {
      onSelectAddress(suggestion.data);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;

      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;

      default:
        break;
    }
  };

  const handleFocus = () => {
    if (inputValue.length >= 3 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          autoComplete="off"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500"></div>
          </div>
        )}
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full text-left px-4 py-2 hover:bg-rose-50 transition-colors ${
                  index === selectedIndex ? 'bg-rose-100' : ''
                } ${index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="text-sm font-medium text-gray-800">
                  {suggestion.label}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {showSuggestions && suggestions.length === 0 && inputValue.length >= 3 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="text-sm text-gray-500 text-center">No results found</p>
        </div>
      )}
      
      {inputValue.length > 0 && inputValue.length < 3 && (
        <p className="text-xs text-gray-500 mt-1">Type at least 3 characters to search</p>
      )}
    </div>
  );
};

export default OpenStreetMapAutocomplete;