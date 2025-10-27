/**
 * Default coordinates for different locations in the Philippines
 */
const DEFAULT_CARIGARA_COORDS = {
  lat: 11.3014,
  lon: 124.6869,
  display_name: 'Carigara, Leyte, Philippines'
};

const DEFAULT_QUEZON_CITY_COORDS = {
  lat: 14.6760,
  lon: 121.0437,
  display_name: 'Quezon City, Metro Manila, Philippines'
};

const DEFAULT_METRO_MANILA_COORDS = {
  lat: 14.5995,
  lon: 120.9842,
  display_name: 'Metro Manila, Philippines'
};

const DEFAULT_LEYTE_COORDS = {
  lat: 11.2500,
  lon: 124.8500,
  display_name: 'Leyte, Eastern Visayas, Philippines'
};

// Rate limiting: track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

/**
 * Get appropriate fallback coordinates based on address content
 * @param {string} address - The address string
 * @returns {Object} - Fallback coordinates
 */
const getFallbackCoords = (address) => {
  const lowerAddress = address.toLowerCase();
  
  // More specific matching for better fallback selection
  if (lowerAddress.includes('quezon city') || lowerAddress.includes('qc') || 
      lowerAddress.includes('batasan') || lowerAddress.includes('jugaban')) {
    return DEFAULT_QUEZON_CITY_COORDS;
  } else if (lowerAddress.includes('metro manila') || lowerAddress.includes('manila') ||
             lowerAddress.includes('makati') || lowerAddress.includes('pasig') ||
             lowerAddress.includes('taguig') || lowerAddress.includes('mandaluyong')) {
    return DEFAULT_METRO_MANILA_COORDS;
  } else if (lowerAddress.includes('carigara')) {
    return DEFAULT_CARIGARA_COORDS;
  } else if (lowerAddress.includes('leyte')) {
    return DEFAULT_LEYTE_COORDS;
  }
  
  // Default to Carigara if no match
  return DEFAULT_CARIGARA_COORDS;
};

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Geocode an address using OpenStreetMap Nominatim API with rate limiting
 * @param {string} address - The address to geocode
 * @param {boolean} useFallback - Whether to use fallback coordinates if geocoding fails
 * @returns {Promise<Object>} - Object with lat, lon, and display_name
 */
export const geocodeAddress = async (address, useFallback = true) => {
  try {
    // Rate limiting: ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
    }
    lastRequestTime = Date.now();
    
    // Clean and encode the address
    const cleanAddress = address.replace(/\s+/g, ' ').trim();
    const encodedAddress = encodeURIComponent(cleanAddress);
    
    // Add countrycodes parameter to limit search to Philippines
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&countrycodes=ph&addressdetails=1`;
    
    console.log(`Geocoding: "${cleanAddress}"`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Pasalubong-Delivery-App/1.0',
        'Accept-Language': 'en'
      }
    });
    
    if (!response.ok) {
      console.error('Nominatim API error:', response.status, response.statusText);
      return useFallback ? getFallbackCoords(address) : null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
      console.log(`Geocoded successfully: ${result.display_name} (${result.lat}, ${result.lon})`);
      return result;
    }
    
    // If no results and fallback is enabled, return appropriate fallback coordinates
    if (useFallback) {
      console.log(`No geocoding results for "${address}", using fallback coordinates`);
      const fallback = getFallbackCoords(address);
      console.log(`Using fallback: ${fallback.display_name} (${fallback.lat}, ${fallback.lon})`);
      return fallback;
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return useFallback ? getFallbackCoords(address) : null;
  }
};

/**
 * Generate route data between two addresses
 * @param {string} pickupAddress - Starting address
 * @param {string} deliveryAddress - Destination address
 * @returns {Promise<Object>} - Route data with coordinates and URL
 */
export const generateRouteData = async (pickupAddress, deliveryAddress) => {
  try {
    console.log('=== Generating route ===');
    console.log('Pickup address:', pickupAddress);
    console.log('Delivery address:', deliveryAddress);
    
    // Geocode addresses sequentially to respect rate limits
    const pickup = await geocodeAddress(pickupAddress, true);
    const delivery = await geocodeAddress(deliveryAddress, true);
    
    if (!pickup || !delivery) {
      throw new Error('Failed to geocode one or both addresses');
    }
    
    console.log('=== Geocoding complete ===');
    console.log('Pickup:', pickup);
    console.log('Delivery:', delivery);
    
    // If both coordinates are very close (within 0.01 degrees ~1km), they likely used same fallback
    const latDiff = Math.abs(pickup.lat - delivery.lat);
    const lonDiff = Math.abs(pickup.lon - delivery.lon);
    
    if (latDiff < 0.01 && lonDiff < 0.01) {
      console.log('Warning: Both addresses geocoded to very similar locations');
      console.log('This likely means geocoding failed for one or both addresses');
      console.log('Using fallback coordinates with offset');
      
      // If pickup is in Leyte area and delivery is not, use appropriate defaults
      if (pickup.lat > 10 && pickup.lat < 12 && delivery.lat > 10 && delivery.lat < 12) {
        // Both in Leyte area, but should be different - use Quezon City for delivery
        delivery.lat = DEFAULT_QUEZON_CITY_COORDS.lat;
        delivery.lon = DEFAULT_QUEZON_CITY_COORDS.lon;
        delivery.display_name = 'Quezon City, Metro Manila, Philippines (Estimated)';
      } else if (delivery.lat > 14 && delivery.lat < 15 && pickup.lat > 14 && pickup.lat < 15) {
        // Both in Metro Manila area - use Carigara for pickup
        pickup.lat = DEFAULT_CARIGARA_COORDS.lat;
        pickup.lon = DEFAULT_CARIGARA_COORDS.lon;
        pickup.display_name = 'Carigara, Leyte, Philippines (Estimated)';
      }
    }
    
    // Calculate approximate distance (Haversine formula)
    const distance = calculateDistance(
      pickup.lat, pickup.lon,
      delivery.lat, delivery.lon
    );
    
    console.log(`Distance: ${distance.toFixed(2)} km`);
    
    // Generate OpenStreetMap route URL
    const routeUrl = `https://www.openstreetmap.org/directions?engine=graphhopper_foot&route=${pickup.lat}%2C${pickup.lon}%3B${delivery.lat}%2C${delivery.lon}`;
    
    return {
      pickup: {
        lat: pickup.lat,
        lon: pickup.lon,
        address: pickup.display_name
      },
      delivery: {
        lat: delivery.lat,
        lon: delivery.lon,
        address: delivery.display_name
      },
      distance: distance.toFixed(2), // in km
      estimatedTime: Math.ceil(distance / 5 * 60), // assuming 5 km/h walking speed, in minutes
      routeUrl
    };
  } catch (error) {
    console.error('Route generation error:', error);
    throw error;
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};