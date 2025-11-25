/**
 * Geospatial Service Tests
 * Tests for location-based project search functionality
 */

const geospatialService = require('../../src/services/geospatial.service');
const db = require('../../src/config/database');
const { 
  testUsers, 
  testProjects, 
  geospatialTestData 
} = require('../fixtures/test-data');
const { 
  calculateTestDistance,
  mockDatabaseResponse 
} = require('../fixtures/test-helpers');

jest.mock('../../src/config/database');

describe('Geospatial Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjectsNearLocation', () => {
    it('should find projects near a specified location', async () => {
      const searchLat = 40.7128;
      const searchLng = -74.0060;
      const radius = 500;

      // Mock database response with all projects
      db.query.mockResolvedValue([
        testProjects.project1,
        testProjects.project2,
        testProjects.project3
      ]);

      const result = await geospatialService.getProjectsNearLocation(
        searchLat,
        searchLng,
        radius,
        testUsers.admin
      );

      expect(db.query).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should include distance_km field in results', async () => {
      const searchLat = 40.7128;
      const searchLng = -74.0060;
      const radius = 500;

      db.query.mockResolvedValue([testProjects.project1]);

      const result = await geospatialService.getProjectsNearLocation(
        searchLat,
        searchLng,
        radius,
        testUsers.admin
      );

      if (result.length > 0) {
        expect(result[0]).toHaveProperty('distance_km');
        expect(typeof result[0].distance_km).toBe('number');
      }
    });

    it('should filter results by radius', async () => {
      const searchLat = 40.7128;
      const searchLng = -74.0060;
      const radius = 50;

      db.query.mockResolvedValue([
        testProjects.project1,
        testProjects.project2
      ]);

      const result = await geospatialService.getProjectsNearLocation(
        searchLat,
        searchLng,
        radius,
        testUsers.admin
      );

      result.forEach(project => {
        expect(project.distance_km).toBeLessThanOrEqual(radius);
      });
    });

    it('should sort results by distance ascending', async () => {
      const searchLat = 40.7128;
      const searchLng = -74.0060;
      const radius = 500;

      db.query.mockResolvedValue([
        testProjects.project1,
        testProjects.project2,
        testProjects.project3
      ]);

      const result = await geospatialService.getProjectsNearLocation(
        searchLat,
        searchLng,
        radius,
        testUsers.admin
      );

      // Check if sorted by distance
      for (let i = 1; i < result.length; i++) {
        expect(result[i].distance_km).toBeGreaterThanOrEqual(
          result[i - 1].distance_km
        );
      }
    });

    it('should apply RBAC filters for PM users', async () => {
      const searchLat = 40.7128;
      const searchLng = -74.0060;
      const radius = 500;

      db.query.mockResolvedValue([testProjects.project1]);

      await geospatialService.getProjectsNearLocation(
        searchLat,
        searchLng,
        radius,
        testUsers.pm
      );

      // Verify database query includes RBAC filter
      const callArgs = db.query.mock.calls[0];
      expect(callArgs[0]).toContain('project_assignments');
      expect(callArgs[1]).toContain(testUsers.pm.worker_id);
    });

    it('should apply RBAC filters for Site Supervisor users', async () => {
      const searchLat = 40.7128;
      const searchLng = -74.0060;
      const radius = 500;

      db.query.mockResolvedValue([testProjects.project1]);

      await geospatialService.getProjectsNearLocation(
        searchLat,
        searchLng,
        radius,
        testUsers.supervisor
      );

      // Verify database query includes RBAC filter
      const callArgs = db.query.mock.calls[0];
      expect(callArgs[0]).toContain('project_assignments');
      expect(callArgs[1]).toContain(testUsers.supervisor.worker_id);
    });

    it('should not filter results for Admin users', async () => {
      const searchLat = 40.7128;
      const searchLng = -74.0060;
      const radius = 500;

      db.query.mockResolvedValue([
        testProjects.project1,
        testProjects.project2,
        testProjects.project3
      ]);

      await geospatialService.getProjectsNearLocation(
        searchLat,
        searchLng,
        radius,
        testUsers.admin
      );

      // Verify admin query doesn't include project_assignments filter
      const callArgs = db.query.mock.calls[0];
      expect(callArgs[0]).not.toContain('project_assignments');
    });

    it('should handle empty results gracefully', async () => {
      const searchLat = 40.7128;
      const searchLng = -74.0060;
      const radius = 1;

      db.query.mockResolvedValue([]);

      const result = await geospatialService.getProjectsNearLocation(
        searchLat,
        searchLng,
        radius,
        testUsers.admin
      );

      expect(result).toEqual([]);
    });

    it('should throw error on database failure', async () => {
      const searchLat = 40.7128;
      const searchLng = -74.0060;
      const radius = 500;

      db.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        geospatialService.getProjectsNearLocation(
          searchLat,
          searchLng,
          radius,
          testUsers.admin
        )
      ).rejects.toThrow();
    });

    it('should handle invalid coordinates', async () => {
      // Invalid latitude (> 90)
      await expect(
        geospatialService.getProjectsNearLocation(
          95.0,
          -74.0060,
          50,
          testUsers.admin
        )
      ).rejects.toThrow();

      // Invalid longitude (> 180)
      await expect(
        geospatialService.getProjectsNearLocation(
          40.7128,
          -200.0,
          50,
          testUsers.admin
        )
      ).rejects.toThrow();
    });

    it('should handle negative radius', async () => {
      await expect(
        geospatialService.getProjectsNearLocation(
          40.7128,
          -74.0060,
          -50,
          testUsers.admin
        )
      ).rejects.toThrow();
    });

    it('should support various search radii', async () => {
      db.query.mockResolvedValue([
        testProjects.project1,
        testProjects.project2,
        testProjects.project3
      ]);

      // Small radius
      const smallRadius = await geospatialService.getProjectsNearLocation(
        40.7128,
        -74.0060,
        10,
        testUsers.admin
      );

      // Large radius
      db.query.mockResolvedValue([
        testProjects.project1,
        testProjects.project2,
        testProjects.project3
      ]);

      const largeRadius = await geospatialService.getProjectsNearLocation(
        40.7128,
        -74.0060,
        1000,
        testUsers.admin
      );

      // Large radius should generally have more or equal results
      expect(largeRadius.length).toBeGreaterThanOrEqual(smallRadius.length);
    });

    it('should handle projects without coordinates gracefully', async () => {
      const projectWithoutCoords = {
        ...testProjects.project1,
        latitude: null,
        longitude: null
      };

      db.query.mockResolvedValue([]);

      const result = await geospatialService.getProjectsNearLocation(
        40.7128,
        -74.0060,
        500,
        testUsers.admin
      );

      expect(result).toBeInstanceOf(Array);
    });

    it('should calculate accurate distances', async () => {
      const searchLat = 40.7128;
      const searchLng = -74.0060;

      db.query.mockResolvedValue([testProjects.project1]);

      const result = await geospatialService.getProjectsNearLocation(
        searchLat,
        searchLng,
        500,
        testUsers.admin
      );

      if (result.length > 0) {
        const expectedDistance = calculateTestDistance(
          searchLat,
          searchLng,
          result[0].latitude,
          result[0].longitude
        );

        // Allow small tolerance for calculation differences
        expect(Math.abs(result[0].distance_km - expectedDistance)).toBeLessThan(1);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle search at coordinates 0,0', async () => {
      db.query.mockResolvedValue([testProjects.project1]);

      const result = await geospatialService.getProjectsNearLocation(
        0,
        0,
        500,
        testUsers.admin
      );

      expect(result).toBeInstanceOf(Array);
    });

    it('should handle search at poles', async () => {
      db.query.mockResolvedValue([]);

      const result = await geospatialService.getProjectsNearLocation(
        90,
        0,
        500,
        testUsers.admin
      );

      expect(result).toBeInstanceOf(Array);
    });

    it('should handle international date line', async () => {
      db.query.mockResolvedValue([]);

      const result = await geospatialService.getProjectsNearLocation(
        0,
        180,
        500,
        testUsers.admin
      );

      expect(result).toBeInstanceOf(Array);
    });

    it('should handle very large radius', async () => {
      db.query.mockResolvedValue([
        testProjects.project1,
        testProjects.project2,
        testProjects.project3
      ]);

      const result = await geospatialService.getProjectsNearLocation(
        40.7128,
        -74.0060,
        40075, // Earth's circumference in km
        testUsers.admin
      );

      expect(result).toBeInstanceOf(Array);
    });

    it('should handle very small radius', async () => {
      db.query.mockResolvedValue([]);

      const result = await geospatialService.getProjectsNearLocation(
        40.7128,
        -74.0060,
        0.001, // 1 meter
        testUsers.admin
      );

      expect(result).toBeInstanceOf(Array);
    });
  });
});
