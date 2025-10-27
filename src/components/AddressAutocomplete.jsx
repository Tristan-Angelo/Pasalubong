import React, { useState, useEffect, useRef } from 'react';
import {
  regions,
  getProvincesForRegion,
  getCitiesForProvince,
  getBarangaysForCity,
  searchLocations
} from '../utils/philippineAddresses';

const AddressAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = 'Start typing...', 
  label,
  type = 'all', // 'all', 'region', 'province', 'city', 'barangay'
  filterByRegion = null,
  filterByProvince = null,
  filterByCity = null,
  required = false,
  disabled = false,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

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

  const getSuggestionsList = (query) => {
    if (!query || query.length < 1) return [];

    let results = [];

    switch (type) {
      case 'region':
        results = regions.filter(r => 
          r.name.toLowerCase().includes(query.toLowerCase())
        ).map(r => ({ value: r.name, label: r.name, data: r }));
        break;

      case 'province':
        if (filterByRegion) {
          const provinces = getProvincesForRegion(filterByRegion);
          results = provinces.filter(p => 
            p.toLowerCase().includes(query.toLowerCase())
          ).map(p => ({ value: p, label: p }));
        } else {
          results = searchLocations(query, 'province').map(p => ({
            value: p.name,
            label: `${p.name} (${p.region})`,
            data: p
          }));
        }
        break;

      case 'city':
        if (filterByProvince) {
          const cities = getCitiesForProvince(filterByProvince);
          results = cities.filter(c => 
            c.toLowerCase().includes(query.toLowerCase())
          ).map(c => ({ value: c, label: c }));
        } else {
          results = searchLocations(query, 'city').map(c => ({
            value: c.name,
            label: `${c.name}, ${c.province}`,
            data: c
          }));
        }
        break;

      case 'barangay':
        if (filterByCity) {
          const barangays = getBarangaysForCity(filterByCity);
          results = barangays.filter(b => 
            b.toLowerCase().includes(query.toLowerCase())
          ).map(b => ({ value: b, label: b }));
        } else {
          results = searchLocations(query, 'barangay').map(b => ({
            value: b.name,
            label: `${b.name}, ${b.city}`,
            data: b
          }));
        }
        break;

      default:
        results = searchLocations(query, 'all').map(item => ({
          value: item.name,
          label: item.name,
          data: item
        }));
    }

    return results.slice(0, 10);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.length >= 1) {
      const results = getSuggestionsList(newValue);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

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
      onChange(suggestion.value, suggestion.data);
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
    if (inputValue.length >= 1) {
      const results = getSuggestionsList(inputValue);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
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
      
      {showSuggestions && suggestions.length === 0 && inputValue.length >= 1 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="text-sm text-gray-500 text-center">No results found</p>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;