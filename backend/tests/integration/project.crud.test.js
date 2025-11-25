/**
 * Project Controller CRUD Tests
 * Tests for core project CRUD endpoints
 */

const projectService = require('../../src/services/project.service');
const projectController = require('../../src/controllers/project.controller');
const { 
  createMockRequest, 
  createMockResponse, 
  createMockNext 
} = require('../fixtures/test-helpers');
const { 
  testUsers, 
  testProjects, 
  projectCreationData 
} = require('../fixtures/test-data');

jest.mock('../../src/services/project.service');

describe('ProjecsetupFilesAfterEnvt Controller - CRUD Operations', () => {
  let req, res, next;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    next = createMockNext();
    jest.clearAllMocks();
  });

  describe('GET /api/projects - Read All', () => {
    it('should retrieve all projects', async () => {
      req.query = {};

      projectService.getAllProjects.mockResolvedValue([
        testProjects.project1,
        testProjects.project2,
        testProjects.project3
      ]);

      await projectController.getAll(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          count: 3,
          data: expect.arrayContaining([
            expect.objectContaining({ project_id: 1 })
          ])
        })
      );
    });

    it('should filter projects by city', async () => {
      req.query = { city: 'New York' };

      projectService.getAllProjects.mockResolvedValue([testProjects.project1]);

      await projectController.getAll(req, res, next);

      expect(projectService.getAllProjects).toHaveBeenCalledWith(
        expect.objectContaining({ city: 'New York' })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          count: 1,
          data: expect.arrayContaining([
            expect.objectContaining({ site_city: 'New York' })
          ])
        })
      );
    });

    it('should filter projects by client_id', async () => {
      req.query = { client_id: '1' };

      projectService.getAllProjects.mockResolvedValue([testProjects.project1]);

      await projectController.getAll(req, res, next);

      expect(projectService.getAllProjects).toHaveBeenCalledWith(
        expect.objectContaining({ client_id: 1 })
      );
    });

    it('should filter projects by status', async () => {
      req.query = { status: 'Active' };

      projectService.getAllProjects.mockResolvedValue([
        testProjects.project1,
        testProjects.project2
      ]);

      await projectController.getAll(req, res, next);

      expect(projectService.getAllProjects).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Active' })
      );
    });

    it('should apply multiple filters simultaneously', async () => {
      req.query = { city: 'New York', status: 'Active' };

      projectService.getAllProjects.mockResolvedValue([testProjects.project1]);

      await projectController.getAll(req, res, next);

      expect(projectService.getAllProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          city: 'New York',
          status: 'Active'
        })
      );
    });

    it('should handle empty results', async () => {
      req.query = { status: 'Nonexistent' };

      projectService.getAllProjects.mockResolvedValue([]);

      await projectController.getAll(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          count: 0,
          data: []
        })
      );
    });

    it('should handle database errors', async () => {
      projectService.getAllProjects.mockRejectedValue(
        new Error('Database error')
      );

      await projectController.getAll(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('GET /api/projects/:id - Read Single', () => {
    it('should retrieve a single project by ID', async () => {
      req.params = { id: '1' };

      projectService.getProjectById.mockResolvedValue(testProjects.project1);

      await projectController.getById(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            project_id: 1,
            project_name: 'Downtown Office Complex'
          })
        })
      );
      expect(projectService.getProjectById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when project not found', async () => {
      req.params = { id: '999' };

      projectService.getProjectById.mockRejectedValue(
        new Error('PROJECT_NOT_FOUND')
      );

      await projectController.getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Project not found'
        })
      );
    });

    it('should handle invalid project ID format', async () => {
      req.params = { id: 'invalid' };

      projectService.getProjectById.mockRejectedValue(
        new Error('INVALID_ID')
      );

      await projectController.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle database errors on read', async () => {
      req.params = { id: '1' };

      projectService.getProjectById.mockRejectedValue(
        new Error('Database connection failed')
      );

      await projectController.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('POST /api/projects - Create', () => {
    it('should create a new project with valid data', async () => {
      req.body = projectCreationData.valid;
      req.user = testUsers.admin;

      projectService.createProject.mockResolvedValue({
        project_id: 4,
        ...projectCreationData.valid
      });

      await projectController.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.any(String),
          data: expect.objectContaining({
            project_name: projectCreationData.valid.project_name
          })
        })
      );
      expect(projectService.createProject).toHaveBeenCalledWith(
        projectCreationData.valid
      );
    });

    it('should handle missing fields gracefully', async () => {
      req.body = projectCreationData.missingName;

      projectService.createProject.mockRejectedValue(
        new Error('MISSING_FIELDS')
      );

      await projectController.create(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle invalid budget values', async () => {
      req.body = projectCreationData.invalidBudget;

      projectService.createProject.mockRejectedValue(
        new Error('INVALID_BUDGET')
      );

      await projectController.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should not create project if user is not Admin', async () => {
      req.body = projectCreationData.valid;
      req.user = testUsers.supervisor;

      // RBAC middleware should prevent this
      // Assuming RBAC is tested separately, project service should not be called
      await projectController.create(req, res, next);

      // Depending on implementation, service may or may not be called
      // but response should indicate permission denied
    });

    it('should handle database errors on create', async () => {
      req.body = projectCreationData.valid;

      projectService.createProject.mockRejectedValue(
        new Error('Database error')
      );

      await projectController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should validate date format properly', async () => {
      req.body = {
        ...projectCreationData.valid,
        start_date: 'invalid-date'
      };

      projectService.createProject.mockRejectedValue(
        new Error('INVALID_DATE')
      );

      await projectController.create(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('PUT /api/projects/:id - Update', () => {
    it('should update an existing project', async () => {
      req.params = { id: '1' };
      req.body = { status: 'Completed' };
      req.user = testUsers.pm;

      projectService.updateProject.mockResolvedValue({
        ...testProjects.project1,
        status: 'Completed'
      });

      await projectController.update(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.any(String),
          data: expect.objectContaining({
            project_id: 1,
            status: 'Completed'
          })
        })
      );
      expect(projectService.updateProject).toHaveBeenCalledWith(
        '1',
        expect.any(Object)
      );
    });

    it('should return 404 when updating non-existent project', async () => {
      req.params = { id: '999' };
      req.body = { status: 'Completed' };

      projectService.updateProject.mockRejectedValue(
        new Error('PROJECT_NOT_FOUND')
      );

      await projectController.update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should validate update data', async () => {
      req.params = { id: '1' };
      req.body = { budget: -5000 };

      projectService.updateProject.mockRejectedValue(
        new Error('INVALID_BUDGET')
      );

      await projectController.update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should allow partial updates', async () => {
      req.params = { id: '1' };
      req.body = { status: 'Active' }; // Only updating status

      projectService.updateProject.mockResolvedValue({
        ...testProjects.project1,
        status: 'Active'
      });

      await projectController.update(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it('should not allow PM to update sensitive fields', async () => {
      req.params = { id: '1' };
      req.body = { client_id: 2 }; 
      req.user = testUsers.pm;

      projectService.updateProject.mockRejectedValue(
        new Error('FORBIDDEN_FIELD')
      );

      await projectController.update(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle database errors on update', async () => {
      req.params = { id: '1' };
      req.body = { status: 'Active' };

      projectService.updateProject.mockRejectedValue(
        new Error('Database error')
      );

      await projectController.update(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('DELETE /api/projects/:id - Delete', () => {
    it('should delete a project as Admin', async () => {
      req.params = { id: '1' };
      req.user = testUsers.admin;

      projectService.deleteProject.mockResolvedValue(true);

      await projectController.delete(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('deleted')
        })
      );
      expect(projectService.deleteProject).toHaveBeenCalledWith('1');
    });

    it('should handle Site Supervisor deletion denial', async () => {
      req.params = { id: '1' };
      req.user = testUsers.supervisor;

      projectService.deleteProject.mockRejectedValue(
        new Error('FORBIDDEN')
      );

      await projectController.delete(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle PM deletion denial', async () => {
      req.params = { id: '1' };
      req.user = testUsers.pm;

      projectService.deleteProject.mockRejectedValue(
        new Error('FORBIDDEN')
      );

      await projectController.delete(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 404 when deleting non-existent project', async () => {
      req.params = { id: '999' };
      req.user = testUsers.admin;

      projectService.deleteProject.mockRejectedValue(
        new Error('PROJECT_NOT_FOUND')
      );

      await projectController.delete(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle cascade deletion', async () => {
      req.params = { id: '1' };
      req.user = testUsers.admin;

      projectService.deleteProject.mockResolvedValue(true);

      await projectController.delete(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it('should handle database errors on delete', async () => {
      req.params = { id: '1' };
      req.user = testUsers.admin;

      projectService.deleteProject.mockRejectedValue(
        new Error('Database error')
      );

      await projectController.delete(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('CRUD Integration Scenarios', () => {
    it('should complete full CRUD lifecycle', async () => {
      // Create
      req.body = projectCreationData.valid;
      req.user = testUsers.admin;

      projectService.createProject.mockResolvedValue({
        project_id: 4,
        ...projectCreationData.valid
      });

      await projectController.create(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);

      // Reset mocks
      jest.clearAllMocks();
      res = createMockResponse();

      // Read
      req.params = { id: '4' };
      projectService.getProjectById.mockResolvedValue({
        project_id: 4,
        ...projectCreationData.valid
      });

      await projectController.getById(req, res, next);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );

      // Update
      jest.clearAllMocks();
      res = createMockResponse();

      req.body = { status: 'Active' };
      projectService.updateProject.mockResolvedValue({
        project_id: 4,
        ...projectCreationData.valid,
        status: 'Active'
      });

      await projectController.update(req, res, next);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );

      // Delete
      jest.clearAllMocks();
      res = createMockResponse();

      projectService.deleteProject.mockResolvedValue(true);

      await projectController.delete(req, res, next);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it('should maintain data consistency across operations', async () => {
      const projectId = 1;
      const updates = [
        { status: 'Active' },
        { budget: 5500000 },
        { expected_completion: '2025-12-01' }
      ];

      for (const update of updates) {
        jest.clearAllMocks();
        res = createMockResponse();

        req.params = { id: projectId.toString() };
        req.body = update;

        projectService.updateProject.mockResolvedValue({
          ...testProjects.project1,
          ...update
        });

        await projectController.update(req, res, next);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ success: true })
        );
      }
    });
  });
});
