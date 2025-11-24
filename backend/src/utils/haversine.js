/**
 * Calculate distance between two geographic points using Haversine formula
 * @param {number} lat1 - Latitude of point 1 in degrees
 * @param {number} lon1 - Longitude of point 1 in degrees  
 * @param {number} lat2 - Latitude of point 2 in degrees
 * @param {number} lon2 - Longitude of point 2 in degrees
 * @returns {number} Distance in kilometers
 * @throws {Error} If coordinates are invalid
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  // Validate input coordinates
  if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || 
      typeof lat2 !== 'number' || typeof lon2 !== 'number') {
    throw new Error('All coordinates must be numbers');
  }
  
  if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90) {
    throw new Error('Latitude must be between -90 and 90 degrees');
  }
  
  if (lon1 < -180 || lon1 > 180 || lon2 < -180 || lon2 > 180) {
    throw new Error('Longitude must be between -180 and 180 degrees');
  }

  // Earth's radius in kilometers
  const R = 6371;

  // Convert degrees to radians
  const toRadians = (degree) => degree * (Math.PI / 180);
  
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  // Haversine formula
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Distance in kilometers
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

module.exports = { haversineDistance };