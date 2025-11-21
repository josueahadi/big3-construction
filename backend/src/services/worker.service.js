const workerRepository = require('../repositories/worker.repository');

/**
 * Worker Service (Business Logic Layer)
 *
 * This module handles worker-related business logic including
 * validation, data transformation, and orchestrating repository calls.
 */

class WorkerService {
  /**
   * Get all workers with optional filtering
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of workers
   */
  async getAllWorkers(filters = {}) {
    return workerRepository.findAll(filters);
  }

  /**
   * Get worker by ID
   * @param {number} workerId - Worker ID
   * @returns {Promise<Object>} Worker object
   */
  async getWorkerById(workerId) {
    const worker = await workerRepository.findById(workerId);

    if (!worker) {
      throw new Error('WORKER_NOT_FOUND');
    }

    return worker;
  }

  /**
   * Create a new worker
   * @param {Object} workerData - Worker data
   * @returns {Promise<Object>} Created worker
   */
  async createWorker(workerData) {
    const { first_name, last_name, phone, salary } = workerData;

    // Validate required fields
    if (!first_name || first_name.trim() === '') {
      throw new Error('FIRST_NAME_REQUIRED');
    }

    if (!last_name || last_name.trim() === '') {
      throw new Error('LAST_NAME_REQUIRED');
    }

    // Validate name length
    if (first_name.length > 100) {
      throw new Error('FIRST_NAME_TOO_LONG');
    }

    if (last_name.length > 100) {
      throw new Error('LAST_NAME_TOO_LONG');
    }

    // Validate phone format if provided
    if (phone) {
      if (phone.length > 20) {
        throw new Error('INVALID_PHONE_FORMAT');
      }
    }

    // Validate salary if provided
    if (salary !== undefined && salary !== null) {
      if (salary < 0) {
        throw new Error('INVALID_SALARY');
      }
      if (salary > 9999999.99) {
        throw new Error('SALARY_TOO_HIGH');
      }
    }

    return workerRepository.create(workerData);
  }

  /**
   * Update worker
   * @param {number} workerId - Worker ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated worker
   */
  async updateWorker(workerId, updates) {
    // Check if worker exists
    const exists = await workerRepository.exists(workerId);
    if (!exists) {
      throw new Error('WORKER_NOT_FOUND');
    }

    // Validate updates
    if (updates.first_name !== undefined) {
      if (!updates.first_name || updates.first_name.trim() === '') {
        throw new Error('FIRST_NAME_REQUIRED');
      }
      if (updates.first_name.length > 100) {
        throw new Error('FIRST_NAME_TOO_LONG');
      }
    }

    if (updates.last_name !== undefined) {
      if (!updates.last_name || updates.last_name.trim() === '') {
        throw new Error('LAST_NAME_REQUIRED');
      }
      if (updates.last_name.length > 100) {
        throw new Error('LAST_NAME_TOO_LONG');
      }
    }

    if (updates.phone !== undefined && updates.phone !== null) {
      if (updates.phone.length > 20) {
        throw new Error('INVALID_PHONE_FORMAT');
      }
    }

    if (updates.salary !== undefined && updates.salary !== null) {
      if (updates.salary < 0) {
        throw new Error('INVALID_SALARY');
      }
      if (updates.salary > 9999999.99) {
        throw new Error('SALARY_TOO_HIGH');
      }
    }

    // Don't allow updating worker_id
    delete updates.worker_id;

    return workerRepository.update(workerId, updates);
  }

  /**
   * Delete worker
   * @param {number} workerId - Worker ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteWorker(workerId) {
    // Check if worker exists
    const exists = await workerRepository.exists(workerId);
    if (!exists) {
      throw new Error('WORKER_NOT_FOUND');
    }

    return workerRepository.delete(workerId);
  }

  /**
   * Add certification to worker
   * @param {number} workerId - Worker ID
   * @param {Object} certData - Certification data
   * @returns {Promise<Object>} Created certification
   */
  async addCertification(workerId, certData) {
    // Check if worker exists
    const exists = await workerRepository.exists(workerId);
    if (!exists) {
      throw new Error('WORKER_NOT_FOUND');
    }

    const { cert_name, expiry_date } = certData;

    // Validate certification name
    if (!cert_name || cert_name.trim() === '') {
      throw new Error('CERT_NAME_REQUIRED');
    }

    if (cert_name.length > 100) {
      throw new Error('CERT_NAME_TOO_LONG');
    }

    // Validate expiry date if provided
    if (expiry_date) {
      const expiryDateObj = new Date(expiry_date);
      if (isNaN(expiryDateObj.getTime())) {
        throw new Error('INVALID_EXPIRY_DATE');
      }
    }

    return workerRepository.addCertification(workerId, certData);
  }

  /**
   * Update certification
   * @param {number} certId - Certification ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated certification
   */
  async updateCertification(certId, updates) {
    // Validate updates
    if (updates.cert_name !== undefined) {
      if (!updates.cert_name || updates.cert_name.trim() === '') {
        throw new Error('CERT_NAME_REQUIRED');
      }
      if (updates.cert_name.length > 100) {
        throw new Error('CERT_NAME_TOO_LONG');
      }
    }

    if (updates.expiry_date !== undefined) {
      const expiryDateObj = new Date(updates.expiry_date);
      if (isNaN(expiryDateObj.getTime())) {
        throw new Error('INVALID_EXPIRY_DATE');
      }
    }

    return workerRepository.updateCertification(certId, updates);
  }

  /**
   * Delete certification
   * @param {number} certId - Certification ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteCertification(certId) {
    return workerRepository.deleteCertification(certId);
  }

  /**
   * Get workers with expiring certifications
   * @param {number} days - Days until expiry
   * @returns {Promise<Array>} Workers with expiring certs
   */
  async getWorkersWithExpiringCerts(days = 30) {
    if (days < 1 || days > 365) {
      throw new Error('INVALID_DAYS_RANGE');
    }

    return workerRepository.getWorkersWithExpiringCerts(days);
  }

  /**
   * Get worker statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    return workerRepository.getStatistics();
  }

  /**
   * Validate worker has active certification
   * @param {number} workerId - Worker ID
   * @param {string} certName - Certification name
   * @returns {Promise<boolean>} True if has active cert
   */
  async hasActiveCertification(workerId, certName) {
    const worker = await workerRepository.findById(workerId);

    if (!worker) {
      return false;
    }

    const activeCert = worker.certifications.find(
      cert => cert.cert_name === certName && cert.status === 'valid'
    );

    return !!activeCert;
  }
}

module.exports = new WorkerService();
