const { enqueueExpiringCerts, runOnce } = require('../../src/jobs/certExpiryProducer');
const pool = require('../../src/config/database');
const { enqueue } = require('../../src/config/queue');

// Mock dependencies
jest.mock('../../src/config/database');
jest.mock('../../src/config/queue');
jest.mock('node-cron', () => ({
  schedule: jest.fn()
}));

describe('Certification Expiry Producer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('enqueueExpiringCerts', () => {
    it('should enqueue messages for expiring certifications', async () => {
      const mockRows = [
        {
          cert_id: 1,
          cert_name: 'Basic Safety',
          expires_at: '2025-01-15',
          days_left: 15,
          worker_id: 10,
          worker_first_name: 'John',
          worker_last_name: 'Doe',
          pm_user_id: 5,
          pm_name: 'Jane Smith',
          pm_email: 'jane@example.com'
        },
        {
          cert_id: 2,
          cert_name: 'Forklift License',
          expires_at: '2025-01-20',
          days_left: 20,
          worker_id: 11,
          worker_first_name: 'Alice',
          worker_last_name: 'Johnson',
          pm_user_id: 6,
          pm_name: 'Bob Manager',
          pm_email: 'bob@example.com'
        }
      ];

      pool.query.mockResolvedValue([mockRows]);
      enqueue.mockResolvedValue();

      const count = await enqueueExpiringCerts();

      expect(count).toBe(2);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(enqueue).toHaveBeenCalledTimes(2);

      // Verify first message structure
      expect(enqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          cert_id: 1,
          cert_name: 'Basic Safety',
          expires_at: '2025-01-15',
          days_left: 15,
          worker_id: 10,
          worker_name: 'John Doe',
          pm_user_id: 5,
          pm_email: 'jane@example.com'
        })
      );

      // Verify second message structure
      expect(enqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          cert_id: 2,
          cert_name: 'Forklift License',
          worker_name: 'Alice Johnson',
          pm_email: 'bob@example.com'
        })
      );
    });

    it('should return 0 and log message when no certifications are expiring', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      pool.query.mockResolvedValue([[]]);

      const count = await enqueueExpiringCerts();

      expect(count).toBe(0);
      expect(enqueue).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No certifications expiring')
      );

      consoleSpy.mockRestore();
    });

    it('should handle worker names with missing data gracefully', async () => {
      const mockRows = [
        {
          cert_id: 3,
          cert_name: 'Safety Training',
          expires_at: '2025-02-01',
          days_left: 30,
          worker_id: 12,
          worker_first_name: '',
          worker_last_name: '',
          pm_user_id: null,
          pm_name: null,
          pm_email: null
        }
      ];

      pool.query.mockResolvedValue([mockRows]);
      enqueue.mockResolvedValue();

      const count = await enqueueExpiringCerts();

      expect(count).toBe(1);
      expect(enqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          worker_name: '',
          pm_user_id: null,
          pm_name: null,
          pm_email: null
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const dbError = new Error('Database connection failed');
      pool.query.mockRejectedValue(dbError);

      const count = await enqueueExpiringCerts();

      expect(count).toBe(0);
      expect(enqueue).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Producer] Error enqueueing messages',
        dbError
      );

      consoleErrorSpy.mockRestore();
    });

    it('should continue processing remaining certs if one enqueue fails', async () => {
      const mockRows = [
        {
          cert_id: 1,
          cert_name: 'Cert 1',
          expires_at: '2025-01-15',
          days_left: 15,
          worker_id: 10,
          worker_first_name: 'John',
          worker_last_name: 'Doe',
          pm_user_id: 5,
          pm_name: 'Jane Smith',
          pm_email: 'jane@example.com'
        },
        {
          cert_id: 2,
          cert_name: 'Cert 2',
          expires_at: '2025-01-16',
          days_left: 16,
          worker_id: 11,
          worker_first_name: 'Alice',
          worker_last_name: 'Johnson',
          pm_user_id: 6,
          pm_name: 'Bob Manager',
          pm_email: 'bob@example.com'
        }
      ];

      pool.query.mockResolvedValue([mockRows]);
      enqueue
        .mockResolvedValueOnce() // First succeeds
        .mockRejectedValueOnce(new Error('Queue error')); // Second fails

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const count = await enqueueExpiringCerts();

      expect(count).toBe(0); // Returns 0 because of error
      expect(enqueue).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should include enqueued_at timestamp in messages', async () => {
      const mockRows = [
        {
          cert_id: 1,
          cert_name: 'Test Cert',
          expires_at: '2025-01-15',
          days_left: 15,
          worker_id: 10,
          worker_first_name: 'John',
          worker_last_name: 'Doe',
          pm_user_id: 5,
          pm_name: 'Jane',
          pm_email: 'jane@example.com'
        }
      ];

      pool.query.mockResolvedValue([mockRows]);
      enqueue.mockResolvedValue();

      await enqueueExpiringCerts();

      expect(enqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          enqueued_at: expect.any(String)
        })
      );

      const enqueuedMsg = enqueue.mock.calls[0][0];
      expect(new Date(enqueuedMsg.enqueued_at)).toBeInstanceOf(Date);
    });
  });

  describe('runOnce', () => {
    it('should call enqueueExpiringCerts once', async () => {
      pool.query.mockResolvedValue([[]]);

      const result = await runOnce();

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(result).toBe(0);
    });

    it('should return the count from enqueueExpiringCerts', async () => {
      const mockRows = [{
        cert_id: 1,
        cert_name: 'Test',
        expires_at: '2025-01-15',
        days_left: 15,
        worker_id: 10,
        worker_first_name: 'John',
        worker_last_name: 'Doe',
        pm_user_id: 5,
        pm_name: 'Jane',
        pm_email: 'jane@example.com'
      }];

      pool.query.mockResolvedValue([mockRows]);
      enqueue.mockResolvedValue();

      const result = await runOnce();

      expect(result).toBe(1);
    });
  });
});
