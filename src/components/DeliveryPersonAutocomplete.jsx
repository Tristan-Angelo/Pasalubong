import React, { useState, useEffect, useRef } from 'react';

const DeliveryPersonAutocomplete = ({ 
  deliveryPersons = [],
  value, 
  onChange, 
  placeholder = 'Search delivery person...', 
  label = 'Select Delivery Person',
  required = false,
  disabled = false,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize selected person from value prop
  useEffect(() => {
    if (value && deliveryPersons.length > 0) {
      const person = deliveryPersons.find(dp => dp.id === value);
      if (person) {
        setSelectedPerson(person);
        setInputValue(person.name);
      }
    } else if (!value) {
      setSelectedPerson(null);
      setInputValue('');
    }
  }, [value, deliveryPersons]);

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

  const getSuggestionsList = (query) => {
    if (!query || query.length < 1) return deliveryPersons;

    const lowerQuery = query.toLowerCase();
    return deliveryPersons.filter(person => 
      person.name.toLowerCase().includes(lowerQuery) ||
      person.phone.toLowerCase().includes(lowerQuery) ||
      person.vehicleType.toLowerCase().includes(lowerQuery) ||
      person.vehiclePlate.toLowerCase().includes(lowerQuery) ||
      person.location.toLowerCase().includes(lowerQuery)
    );
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedPerson(null);
    
    const results = getSuggestionsList(newValue);
    setSuggestions(results);
    setShowSuggestions(true);
    setSelectedIndex(-1);

    // Clear selection when typing
    if (onChange) {
      onChange('');
    }
  };

  const handleSuggestionClick = (person) => {
    setInputValue(person.name);
    setSelectedPerson(person);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    
    if (onChange) {
      onChange(person.id);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

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
    const results = getSuggestionsList(inputValue);
    setSuggestions(results);
    setShowSuggestions(true);
  };

  const handleClear = () => {
    setInputValue('');
    setSelectedPerson(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    if (onChange) {
      onChange('');
    }
    inputRef.current?.focus();
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
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          autoComplete="off"
        />
        
        {/* Clear button */}
        {inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
        
        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((person, index) => (
              <button
                key={person.id}
                type="button"
                onClick={() => handleSuggestionClick(person)}
                className={`w-full text-left px-4 py-3 hover:bg-rose-50 transition-colors ${
                  index === selectedIndex ? 'bg-rose-100' : ''
                } ${index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {/* Delivery Person Photo */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gray-200">
                    {person.photo ? (
                      <img
                        src={person.photo}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                        🚚
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
                      {person.name}
                      {person.isActive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      📱 {person.phone} • 🚗 {person.vehicleType} ({person.vehiclePlate})
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      📍 {person.location}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {/* No results message */}
        {showSuggestions && suggestions.length === 0 && inputValue.length >= 1 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
            <p className="text-sm text-gray-500 text-center">No delivery persons found</p>
          </div>
        )}
        
        {/* Empty state when no delivery persons available */}
        {showSuggestions && deliveryPersons.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
            <p className="text-sm text-gray-500 text-center">No delivery persons available</p>
          </div>
        )}
      </div>
      
      {/* Selected person display */}
      {selectedPerson && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            {/* Selected Person Photo */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex-shrink-0 border-2 border-green-300">
              {selectedPerson.photo ? (
                <img
                  src={selectedPerson.photo}
                  alt={selectedPerson.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-green-600 text-sm">
                  🚚
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">✓ Selected: {selectedPerson.name}</p>
              <p className="text-xs text-green-700 mt-1">
                {selectedPerson.vehicleType} ({selectedPerson.vehiclePlate}) • {selectedPerson.location}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPersonAutocomplete;