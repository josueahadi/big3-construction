const materialRepository = require('../repositories/material.repository');

/**
 * Material Service (Business Logic Layer)
 *
 * This module handles material-related business logic including
 * validation, data transformation, and orchestrating repository calls.
 */

class MaterialService {
  /**
   * Get all materials with optional filtering
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of materials
   */
  async getAllMaterials(filters = {}) {
    return materialRepository.findAll(filters);
  }

  /**
   * Get material by ID
   * @param {number} materialId - Material ID
   * @returns {Promise<Object>} Material object
   */
  async getMaterialById(materialId) {
    const material = await materialRepository.findById(materialId);

    if (!material) {
      throw new Error('MATERIAL_NOT_FOUND');
    }

    return material;
  }

  /**
   * Create a new material
   * @param {Object} materialData - Material data
   * @returns {Promise<Object>} Created material
   */
  async createMaterial(materialData) {
    const { material_name, unit_cost } = materialData;

    // Validate required fields
    if (!material_name || material_name.trim() === '') {
      throw new Error('MATERIAL_NAME_REQUIRED');
    }

    if (unit_cost === undefined || unit_cost === null) {
      throw new Error('UNIT_COST_REQUIRED');
    }

    // Validate name length
    if (material_name.length > 100) {
      throw new Error('MATERIAL_NAME_TOO_LONG');
    }

    // Validate unit cost
    if (unit_cost < 0) {
      throw new Error('INVALID_UNIT_COST');
    }

    if (unit_cost > 99999999.99) {
      throw new Error('UNIT_COST_TOO_HIGH');
    }

    return materialRepository.create(materialData);
  }

  /**
   * Update material
   * @param {number} materialId - Material ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated material
   */
  async updateMaterial(materialId, updates) {
    // Check if material exists
    const exists = await materialRepository.exists(materialId);
    if (!exists) {
      throw new Error('MATERIAL_NOT_FOUND');
    }

    // Validate updates
    if (updates.material_name !== undefined) {
      if (!updates.material_name || updates.material_name.trim() === '') {
        throw new Error('MATERIAL_NAME_REQUIRED');
      }
      if (updates.material_name.length > 100) {
        throw new Error('MATERIAL_NAME_TOO_LONG');
      }
    }

    if (updates.unit_cost !== undefined) {
      if (updates.unit_cost < 0) {
        throw new Error('INVALID_UNIT_COST');
      }
      if (updates.unit_cost > 99999999.99) {
        throw new Error('UNIT_COST_TOO_HIGH');
      }
    }

    // Don't allow updating material_id
    delete updates.material_id;

    return materialRepository.update(materialId, updates);
  }

  /**
   * Delete material
   * @param {number} materialId - Material ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteMaterial(materialId) {
    // Check if material exists
    const exists = await materialRepository.exists(materialId);
    if (!exists) {
      throw new Error('MATERIAL_NOT_FOUND');
    }

    return materialRepository.delete(materialId);
  }

  /**
   * Get material statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    return materialRepository.getStatistics();
  }

  /**
   * Get most expensive materials
   * @param {number} limit - Number of materials to return
   * @returns {Promise<Array>} Most expensive materials
   */
  async getMostExpensive(limit = 10) {
    if (limit < 1 || limit > 100) {
      throw new Error('INVALID_LIMIT');
    }

    return materialRepository.getMostExpensive(limit);
  }
}

module.exports = new MaterialService();
