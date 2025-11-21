const clientRepository = require('../repositories/client.repository');

/**
 * Client Service (Business Logic Layer)
 *
 * This module handles client-related business logic including
 * validation, data transformation, and orchestrating repository calls.
 */

class ClientService {
  /**
   * Get all clients with optional filtering
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of clients
   */
  async getAllClients(filters = {}) {
    return clientRepository.findAll(filters);
  }

  /**
   * Get client by ID
   * @param {number} clientId - Client ID
   * @returns {Promise<Object>} Client object
   */
  async getClientById(clientId) {
    const client = await clientRepository.findById(clientId);

    if (!client) {
      throw new Error('CLIENT_NOT_FOUND');
    }

    return client;
  }

  /**
   * Create a new client
   * @param {Object} clientData - Client data
   * @returns {Promise<Object>} Created client
   */
  async createClient(clientData) {
    const { client_name, client_phone } = clientData;

    // Validate required fields
    if (!client_name || client_name.trim() === '') {
      throw new Error('CLIENT_NAME_REQUIRED');
    }

    // Validate name length
    if (client_name.length > 100) {
      throw new Error('CLIENT_NAME_TOO_LONG');
    }

    // Validate phone format if provided
    if (client_phone) {
      if (client_phone.length > 20) {
        throw new Error('INVALID_PHONE_FORMAT');
      }
    }

    // Check if client name already exists
    const nameExists = await clientRepository.nameExists(client_name);
    if (nameExists) {
      throw new Error('CLIENT_NAME_EXISTS');
    }

    return clientRepository.create(clientData);
  }

  /**
   * Update client
   * @param {number} clientId - Client ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated client
   */
  async updateClient(clientId, updates) {
    // Check if client exists
    const exists = await clientRepository.exists(clientId);
    if (!exists) {
      throw new Error('CLIENT_NOT_FOUND');
    }

    // Validate updates
    if (updates.client_name !== undefined) {
      if (!updates.client_name || updates.client_name.trim() === '') {
        throw new Error('CLIENT_NAME_REQUIRED');
      }
      if (updates.client_name.length > 100) {
        throw new Error('CLIENT_NAME_TOO_LONG');
      }

      // Check if new name already exists
      const nameExists = await clientRepository.nameExists(updates.client_name, clientId);
      if (nameExists) {
        throw new Error('CLIENT_NAME_EXISTS');
      }
    }

    if (updates.client_phone !== undefined && updates.client_phone !== null) {
      if (updates.client_phone.length > 20) {
        throw new Error('INVALID_PHONE_FORMAT');
      }
    }

    // Don't allow updating client_id
    delete updates.client_id;

    return clientRepository.update(clientId, updates);
  }

  /**
   * Delete client
   * @param {number} clientId - Client ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteClient(clientId) {
    // Check if client exists
    const exists = await clientRepository.exists(clientId);
    if (!exists) {
      throw new Error('CLIENT_NOT_FOUND');
    }

    // Check if client has projects
    const client = await clientRepository.findById(clientId);
    if (client.projects && client.projects.length > 0) {
      throw new Error('CLIENT_HAS_PROJECTS');
    }

    return clientRepository.delete(clientId);
  }

  /**
   * Get client statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    return clientRepository.getStatistics();
  }

  /**
   * Get top clients by project count
   * @param {number} limit - Number of clients to return
   * @returns {Promise<Array>} Top clients
   */
  async getTopClients(limit = 10) {
    if (limit < 1 || limit > 100) {
      throw new Error('INVALID_LIMIT');
    }

    return clientRepository.getTopClients(limit);
  }
}

module.exports = new ClientService();
