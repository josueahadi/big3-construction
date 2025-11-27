const db = require('../config/database');
const { haversineDistance } = require('../utils/haversine');

/**
 * Service for geospatial operations
 * @namespace geospatialService
 */
const geospatialService = {
  /**
   * Get projects near a specified location with RBAC filtering
   * @param {number} lat - Search latitude (-90 to 90)
   * @param {number} lng - Search longitude (-180 to 180) 
   * @param {number} radius - Search radius in kilometers
   * @param {object} user - Authenticated user object with role and user_id
   * @returns {Promise<Array>} Array of projects with distance_km field
   * @throws {Error} If database query fails
   */
  async getProjectsNearLocation(lat, lng, radius, user) {
    try {
      // Base query to get all projects with coordinates
      let sql = `
        SELECT p.project_id, p.project_name, p.site_city, p.latitude, p.longitude
        FROM projects p
        WHERE p.latitude IS NOT NULL AND p.longitude IS NOT NULL
      `;
      
      const params = [];

      // RBAC: Filter by user role
      if (user.role === 'PM' || user.role === 'Site Supervisor') {
        sql += ` AND EXISTS (
          SELECT 1 FROM project_assignments pa 
          WHERE pa.project_id = p.project_id AND pa.worker_id = ?
        )`;
        params.push(user.worker_id);
      }
      // Admin role sees all projects (no additional filter)

      // FIXED: No destructuring - db.query returns rows directly
      const projects = await db.query(sql, params);

      // Calculate distance and filter by radius
      const nearbyProjects = projects
        .map(project => {
          // Convert latitude and longitude from string/DECIMAL to number
          const projectLat = parseFloat(project.latitude);
          const projectLng = parseFloat(project.longitude);
          
          const distance = haversineDistance(
            lat, lng, 
            projectLat, projectLng
          );
          return {
            ...project,
            latitude: projectLat,
            longitude: projectLng,
            distance_km: distance
          };
        })
        .filter(project => project.distance_km <= radius)
        .sort((a, b) => a.distance_km - b.distance_km);

      return nearbyProjects;

    } catch (error) {
      console.error('Geospatial service error:', error);
      throw new Error('DATABASE_ERROR');
    }
  }
};

module.exports = geospatialService;