const supplierRepository = require('../repositories/supplier.repository');

/**
 * Supplier Service (Business Logic Layer)
 *
 * This module handles supplier-related business logic including
 * validation, data transformation, and orchestrating repository calls.
 */

class SupplierService {
  /**
   * Get all suppliers with optional filtering
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of suppliers
   */
  async getAllSuppliers(filters = {}) {
    return supplierRepository.findAll(filters);
  }

  /**
   * Get supplier by ID
   * @param {number} supplierId - Supplier ID
   * @returns {Promise<Object>} Supplier object
   */
  async getSupplierById(supplierId) {
    const supplier = await supplierRepository.findById(supplierId);

    if (!supplier) {
      throw new Error('SUPPLIER_NOT_FOUND');
    }

    return supplier;
  }

  /**
   * Create a new supplier
   * @param {Object} supplierData - Supplier data
   * @returns {Promise<Object>} Created supplier
   */
  async createSupplier(supplierData) {
    const { supplier_name, supplier_phone } = supplierData;

    // Validate required fields
    if (!supplier_name || supplier_name.trim() === '') {
      throw new Error('SUPPLIER_NAME_REQUIRED');
    }

    // Validate name length
    if (supplier_name.length > 100) {
      throw new Error('SUPPLIER_NAME_TOO_LONG');
    }

    // Validate phone length if provided
    if (supplier_phone && supplier_phone.length > 20) {
      throw new Error('INVALID_PHONE_FORMAT');
    }

    // Check if supplier name already exists
    const nameExists = await supplierRepository.nameExists(supplier_name);
    if (nameExists) {
      throw new Error('SUPPLIER_NAME_EXISTS');
    }

    return supplierRepository.create(supplierData);
  }

  /**
   * Update supplier
   * @param {number} supplierId - Supplier ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated supplier
   */
  async updateSupplier(supplierId, updates) {
    // Check if supplier exists
    const exists = await supplierRepository.exists(supplierId);
    if (!exists) {
      throw new Error('SUPPLIER_NOT_FOUND');
    }

    // Validate updates
    if (updates.supplier_name !== undefined) {
      if (!updates.supplier_name || updates.supplier_name.trim() === '') {
        throw new Error('SUPPLIER_NAME_REQUIRED');
      }
      if (updates.supplier_name.length > 100) {
        throw new Error('SUPPLIER_NAME_TOO_LONG');
      }

      // Check if new name already exists for another supplier
      const nameExists = await supplierRepository.nameExists(
        updates.supplier_name,
        supplierId
      );
      if (nameExists) {
        throw new Error('SUPPLIER_NAME_EXISTS');
      }
    }

    if (updates.supplier_phone !== undefined) {
      if (updates.supplier_phone && updates.supplier_phone.length > 20) {
        throw new Error('INVALID_PHONE_FORMAT');
      }
    }

    // Don't allow updating supplier_id
    delete updates.supplier_id;

    return supplierRepository.update(supplierId, updates);
  }

  /**
   * Delete supplier
   * @param {number} supplierId - Supplier ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteSupplier(supplierId) {
    // Check if supplier exists
    const exists = await supplierRepository.exists(supplierId);
    if (!exists) {
      throw new Error('SUPPLIER_NOT_FOUND');
    }

    // Check if supplier has material supplies
    const supplier = await supplierRepository.findById(supplierId);
    if (supplier.material_supplies && supplier.material_supplies.length > 0) {
      throw new Error('SUPPLIER_HAS_SUPPLIES');
    }

    return supplierRepository.delete(supplierId);
  }

  /**
   * Get supplier statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    return supplierRepository.getStatistics();
  }

  /**
   * Get top suppliers by supply value
   * @param {number} limit - Number of suppliers to return
   * @returns {Promise<Array>} Top suppliers
   */
  async getTopSuppliers(limit = 10) {
    if (limit < 1 || limit > 100) {
      throw new Error('INVALID_LIMIT');
    }

    return supplierRepository.getTopSuppliers(limit);
  }
}

module.exports = new SupplierService();
