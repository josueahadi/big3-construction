const { haversineDistance } = require('../../src/utils/haversine');

describe('Haversine Distance Calculator', () => {
  describe('Valid Calculations', () => {
    test('should calculate distance between Kigali and Huye correctly', () => {
      // Kigali coordinates
      const kigaliLat = -1.9536;
      const kigaliLon = 30.0606;

      // Huye coordinates
      const huyeLat = -2.5958;
      const huyeLon = 29.7466;

      const distance = haversineDistance(kigaliLat, kigaliLon, huyeLat, huyeLon);

      // Expected distance is approximately 75-80 km
      expect(distance).toBeGreaterThan(70);
      expect(distance).toBeLessThan(85);
      expect(typeof distance).toBe('number');
    });

    test('should return 0 for same coordinates', () => {
      const lat = -1.9536;
      const lon = 30.0606;

      const distance = haversineDistance(lat, lon, lat, lon);

      expect(distance).toBe(0);
    });

    test('should handle coordinates at equator', () => {
      const distance = haversineDistance(0, 0, 0, 1);

      // 1 degree longitude at equator ≈ 111 km
      expect(distance).toBeGreaterThan(100);
      expect(distance).toBeLessThan(120);
    });

    test('should handle negative and positive coordinates', () => {
      const distance = haversineDistance(-10, -20, 10, 20);

      expect(distance).toBeGreaterThan(0);
      expect(typeof distance).toBe('number');
    });

    test('should return distance rounded to 2 decimal places', () => {
      const distance = haversineDistance(-1.9536, 30.0606, -2.5958, 29.7466);

      // Check that it has at most 2 decimal places
      const decimalPlaces = (distance.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    test('should calculate distance between extreme latitudes', () => {
      // North Pole to South Pole (approximately half Earth's circumference)
      const distance = haversineDistance(90, 0, -90, 0);

      // Expected: approximately 20,000 km (half of Earth's circumference)
      expect(distance).toBeGreaterThan(19000);
      expect(distance).toBeLessThan(21000);
    });
  });

  describe('Input Validation', () => {
    test('should throw error for non-number latitude', () => {
      expect(() => {
        haversineDistance('not a number', 30, -1, 29);
      }).toThrow('All coordinates must be numbers');
    });

    test('should throw error for non-number longitude', () => {
      expect(() => {
        haversineDistance(-1, 'not a number', -2, 29);
      }).toThrow('All coordinates must be numbers');
    });

    test('should throw error for undefined coordinates', () => {
      expect(() => {
        haversineDistance(undefined, 30, -1, 29);
      }).toThrow('All coordinates must be numbers');
    });

    test('should throw error for null coordinates', () => {
      expect(() => {
        haversineDistance(null, 30, -1, 29);
      }).toThrow('All coordinates must be numbers');
    });

    test('should throw error for latitude > 90', () => {
      expect(() => {
        haversineDistance(91, 30, -1, 29);
      }).toThrow('Latitude must be between -90 and 90 degrees');
    });

    test('should throw error for latitude < -90', () => {
      expect(() => {
        haversineDistance(-91, 30, -1, 29);
      }).toThrow('Latitude must be between -90 and 90 degrees');
    });

    test('should throw error for longitude > 180', () => {
      expect(() => {
        haversineDistance(-1, 181, -2, 29);
      }).toThrow('Longitude must be between -180 and 180 degrees');
    });

    test('should throw error for longitude < -180', () => {
      expect(() => {
        haversineDistance(-1, -181, -2, 29);
      }).toThrow('Longitude must be between -180 and 180 degrees');
    });

    test('should accept valid boundary values', () => {
      // Test latitude boundaries
      expect(() => haversineDistance(90, 0, -90, 0)).not.toThrow();
      expect(() => haversineDistance(-90, 0, 90, 0)).not.toThrow();

      // Test longitude boundaries
      expect(() => haversineDistance(0, 180, 0, -180)).not.toThrow();
      expect(() => haversineDistance(0, -180, 0, 180)).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle very small distances', () => {
      // Points 0.001 degrees apart
      const distance = haversineDistance(0, 0, 0.001, 0.001);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1); // Less than 1 km
    });

    test('should handle antipodal points (opposite sides of Earth)', () => {
      // Two points on opposite sides of the equator
      const distance = haversineDistance(0, 0, 0, 180);

      // Expected: approximately 20,000 km (half circumference)
      expect(distance).toBeGreaterThan(19000);
      expect(distance).toBeLessThan(21000);
    });

    test('should handle coordinates at International Date Line', () => {
      const distance = haversineDistance(0, 179, 0, -179);

      // Should be a small distance (crossing date line)
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(300);
    });
  });

  describe('Mathematical Correctness', () => {
    test('should be commutative (A to B = B to A)', () => {
      const lat1 = -1.9536;
      const lon1 = 30.0606;
      const lat2 = -2.5958;
      const lon2 = 29.7466;

      const distance1 = haversineDistance(lat1, lon1, lat2, lon2);
      const distance2 = haversineDistance(lat2, lon2, lat1, lon1);

      expect(distance1).toBe(distance2);
    });

    test('should satisfy triangle inequality', () => {
      // Point A: Kigali
      const latA = -1.9536;
      const lonA = 30.0606;

      // Point B: Huye
      const latB = -2.5958;
      const lonB = 29.7466;

      // Point C: Muhanga
      const latC = -2.0839;
      const lonC = 29.7390;

      const distAB = haversineDistance(latA, lonA, latB, lonB);
      const distBC = haversineDistance(latB, lonB, latC, lonC);
      const distAC = haversineDistance(latA, lonA, latC, lonC);

      // Triangle inequality: AC <= AB + BC
      expect(distAC).toBeLessThanOrEqual(distAB + distBC + 0.01); // +0.01 for rounding
    });
  });
});
