/**
 * RBAC (Role-Based Access Control) Middleware Tests
 * Tests to ensure proper role-based authorization
 */

const rbacMiddleware = require('../../src/middleware/rbac.middleware');
const { 
  createMockRequest, 
  createMockResponse, 
  createMockNext 
} = require('../fixtures/test-helpers');
const { testUsers } = require('../fixtures/test-data');

describe('RBAC Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    next = createMockNext();
  });

  describe('requireRole', () => {
    it('should allow Admin to access Admin-only resource', () => {
      req.user = testUsers.admin;
      const middleware = rbacMiddleware.requireRole(['Admin']);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow Admin to access PM-level resource', () => {
      req.user = testUsers.admin;
      const middleware = rbacMiddleware.requireRole(['PM', 'Admin']);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow PM to access PM-level resource', () => {
      req.user = testUsers.pm;
      const middleware = rbacMiddleware.requireRole(['PM', 'Admin']);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny Site Supervisor from deleting projects (Admin only)', () => {
      req.user = testUsers.supervisor;
      const middleware = rbacMiddleware.requireRole(['Admin']);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Insufficient permissions')
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny Site Supervisor from modifying projects (PM/Admin only)', () => {
      req.user = testUsers.supervisor;
      const middleware = rbacMiddleware.requireRole(['PM', 'Admin']);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny PM from deleting projects (Admin only)', () => {
      req.user = testUsers.pm;
      const middleware = rbacMiddleware.requireRole(['Admin']);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return error when user is not authenticated', () => {
      req.user = null;
      const middleware = rbacMiddleware.requireRole(['Admin']);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Authentication required')
        })
      );
    });

    it('should return proper error message indicating required roles', () => {
      req.user = testUsers.supervisor;
      const middleware = rbacMiddleware.requireRole(['Admin', 'PM']);

      middleware(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Admin, PM')
        })
      );
    });

    it('should handle multiple allowed roles correctly', () => {
      req.user = testUsers.supervisor;
      const allowedRoles = ['Admin', 'PM', 'Site Supervisor'];
      const middleware = rbacMiddleware.requireRole(allowedRoles);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('adminOnly', () => {
    it('should allow only Admin users', () => {
      req.user = testUsers.admin;
      const middleware = rbacMiddleware.adminOnly;

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny PM users', () => {
      req.user = testUsers.pm;
      const middleware = rbacMiddleware.adminOnly;

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny Site Supervisor users', () => {
      req.user = testUsers.supervisor;
      const middleware = rbacMiddleware.adminOnly;

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('adminOrPM', () => {
    it('should allow Admin users', () => {
      req.user = testUsers.admin;
      const middleware = rbacMiddleware.adminOrPM;

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow PM users', () => {
      req.user = testUsers.pm;
      const middleware = rbacMiddleware.adminOrPM;

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny Site Supervisor users', () => {
      req.user = testUsers.supervisor;
      const middleware = rbacMiddleware.adminOrPM;

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Role Hierarchy', () => {
    it('should enforce Admin > PM > Site Supervisor hierarchy', () => {
      const adminMiddleware = rbacMiddleware.requireRole(['Admin']);
      const pmMiddleware = rbacMiddleware.requireRole(['PM', 'Admin']);
      const supervisorMiddleware = rbacMiddleware.requireRole(['Site Supervisor', 'PM', 'Admin']);

      // Admin can access all levels
      req.user = testUsers.admin;
      adminMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();

      jest.clearAllMocks();
      req.user = testUsers.admin;
      pmMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();

      jest.clearAllMocks();
      req.user = testUsers.admin;
      supervisorMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();

      // PM cannot access Admin level
      jest.clearAllMocks();
      req.user = testUsers.pm;
      adminMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Real-world scenarios', () => {
    it('should prevent Site Supervisor from deleting a project', () => {
      req.user = testUsers.supervisor;
      const deleteProjectMiddleware = rbacMiddleware.requireRole(['Admin']);

      deleteProjectMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String)
        })
      );
    });

    it('should allow PM to update project details but not delete it', () => {
      req.user = testUsers.pm;
      
      // PM can update
      const updateMiddleware = rbacMiddleware.requireRole(['Admin', 'PM']);
      updateMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();

      // PM cannot delete
      jest.clearAllMocks();
      req.user = testUsers.pm;
      const deleteMiddleware = rbacMiddleware.requireRole(['Admin']);
      deleteMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should allow Admin to perform all operations', () => {
      req.user = testUsers.admin;
      
      // Can create
      let middleware = rbacMiddleware.requireRole(['Admin', 'PM']);
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();

      // Can update
      jest.clearAllMocks();
      req.user = testUsers.admin;
      middleware = rbacMiddleware.requireRole(['Admin', 'PM']);
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();

      // Can delete
      jest.clearAllMocks();
      req.user = testUsers.admin;
      middleware = rbacMiddleware.requireRole(['Admin']);
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should allow Site Supervisor read-only access', () => {
      req.user = testUsers.supervisor;
      
      // Can read (no role restriction for GET operations typically)
      const readMiddleware = rbacMiddleware.requireRole(['Admin', 'PM', 'Site Supervisor']);
      readMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();

      // Cannot modify
      jest.clearAllMocks();
      req.user = testUsers.supervisor;
      const modifyMiddleware = rbacMiddleware.requireRole(['Admin', 'PM']);
      modifyMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
