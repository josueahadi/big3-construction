const workerRepository = require('../../src/repositories/worker.repository');
const pool = require('../../src/config/database');

jest.mock('../../src/config/database');

describe('Worker Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all workers from database', async () => {
      const mockWorkers = [
        { worker_id: 1, first_name: 'John', last_name: 'Doe' },
        { worker_id: 2, first_name: 'Jane', last_name: 'Smith' }
      ];

      pool.query.mockResolvedValue([mockWorkers]);

      // TODO: Call findAll()
      // TODO: Verify returns mock workers
      // TODO: Verify SQL query was correct
    });
  });

  describe('findById', () => {
    it('should return single worker by ID', async () => {
      // TODO: Mock query result
      // TODO: Test findById(1)
      // TODO: Verify correct WHERE clause
    });

    it('should return null when worker not found', async () => {
      // TODO: Mock empty result
      // TODO: Verify returns null
    });
  });

  describe('create', () => {
    it('should insert new worker and return with ID', async () => {
      const newWorker = {
        first_name: 'John',
        last_name: 'Doe',
        phone: '555-1234',
        salary: 50000
      };

      pool.query.mockResolvedValue([{ insertId: 1 }]);

      // TODO: Call create(newWorker)
      // TODO: Verify INSERT query
      // TODO: Verify returns worker with ID
    });
  });

  // TODO: Add tests for update, delete, findByEmail, etc.
});