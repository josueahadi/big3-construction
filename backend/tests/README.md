# Big3 Construction API - Test Suite

This directory contains comprehensive unit and integration tests for the Big3 Construction Management Dashboard API.

## Overview

The test suite covers the following key areas:

1. **Authentication (Auth)** - User registration and login functionality
2. **Role-Based Access Control (RBAC)** - Permission and authorization rules
3. **Geospatial Search** - Location-based project queries
4. **CRUD Operations** - Core project endpoint operations

## Directory Structure

```
tests/
├── setup.js                      # Jest configuration and global setup
├── fixtures/
│   ├── test-data.js             # Mock data for all tests
│   └── test-helpers.js          # Utility functions for testing
├── unit/
│   ├── auth.controller.test.js   # Authentication endpoint tests
│   ├── rbac.middleware.test.js   # Authorization rule tests
│   └── geospatial.service.test.js # Location search tests
└── integration/
    └── project.crud.test.js      # Project CRUD endpoint tests
```

## Test Files

### Unit Tests (`tests/unit/`)

#### `auth.controller.test.js`
Tests user authentication endpoints including:
- **Registration**: Valid/invalid email, weak passwords, duplicate emails
- **Login**: Valid credentials, invalid passwords, non-existent users
- **Logout**: Token invalidation
- **Error Handling**: Database errors, missing fields

**Test Count**: 20+ test cases

#### `rbac.middleware.test.js`
Tests role-based access control including:
- **Role Enforcement**: Validates Admin, PM, and Site Supervisor permissions
- **Permission Hierarchy**: Ensures Admin > PM > Site Supervisor privilege levels
- **Denial Scenarios**: Prevents unauthorized access (e.g., Site Supervisor cannot delete projects)
- **Real-world Scenarios**: Practical use cases like update vs delete permissions

**Test Count**: 25+ test cases

#### `geospatial.service.test.js`
Tests location-based project search including:
- **Search Functionality**: Finding projects near coordinates
- **Distance Calculation**: Accurate haversine distance calculations
- **Radius Filtering**: Projects within specified radius
- **Sorting**: Results sorted by distance
- **RBAC Integration**: Filters applied based on user role
- **Edge Cases**: Poles, international date line, extreme radii

**Test Count**: 30+ test cases

### Integration Tests (`tests/integration/`)

#### `project.crud.test.js`
Tests all CRUD operations on the projects endpoint:
- **CREATE (POST)**: Valid/invalid data, validation rules, permission checks
- **READ (GET)**: All projects, single project, filtering by city/client/status
- **UPDATE (PUT)**: Partial updates, field restrictions by role, validation
- **DELETE (DELETE)**: Permission-based access, cascade deletion, data integrity
- **Lifecycle**: Complete CRUD workflows and data consistency

**Test Count**: 35+ test cases

### Fixtures (`tests/fixtures/`)

#### `test-data.js`
Provides mock data for all tests:
- Test users (Admin, PM, Site Supervisor)
- Registration/login test data
- Sample projects with coordinates
- JWT tokens for different roles
- Geospatial search scenarios
- Project creation payloads

#### `test-helpers.js`
Utility functions for testing:
- `generateToken()` - Create JWT tokens
- `createMockRequest()` - Create Express request objects
- `createMockResponse()` - Create Express response objects with spies
- `createMockNext()` - Create error handler mock
- `calculateTestDistance()` - Calculate haversine distance
- `createAuthHeader()` - Generate auth headers

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run only unit tests
```bash
npm run test:unit
```

### Run only integration tests
```bash
npm run test:integration
```

### Run with coverage
```bash
npm test -- --coverage
```

### Run specific test file
```bash
npm test auth.controller.test.js
```

## Test Coverage

The test suite aims for >70% coverage across:
- **Statements**: 70%+
- **Branches**: 70%+
- **Functions**: 70%+
- **Lines**: 70%+

View coverage report after running tests:
```bash
open coverage/lcov-report/index.html
```

## Key Test Scenarios

### Authentication Tests
✅ User can register with valid credentials
✅ Registration rejects duplicate emails
✅ Registration rejects weak passwords
✅ User can login with correct credentials
✅ Login rejects invalid passwords
✅ Tokens contain user role and permissions

### RBAC Tests
✅ Admin can access all resources
✅ PM can update but not delete projects
✅ Site Supervisor has read-only access
✅ Site Supervisor cannot delete projects
✅ Proper error messages for unauthorized access
✅ Permission hierarchy is enforced

### Geospatial Tests
✅ Find projects near location
✅ Filter results by radius
✅ Sort results by distance
✅ Role-based filtering applied
✅ Accurate distance calculations
✅ Handle invalid coordinates
✅ Handle edge cases (poles, date line)

### CRUD Tests
✅ Create project with valid data
✅ Validation errors on missing fields
✅ Read all projects with filters
✅ Read single project by ID
✅ Update project fields
✅ Delete project (Admin only)
✅ Permission checks enforced
✅ 404 errors for non-existent resources
✅ Data consistency across operations

## Environment Configuration

Tests use `.env.test` for configuration. Key test settings:
- Test database: `big3_construction_test`
- Test JWT secret: `test_secret_key_do_not_use_in_production`
- Reduced bcrypt rounds (5) for faster tests
- Disabled rate limiting for tests

## Mocking Strategy

The test suite uses Jest mocking for:
- **Database**: All database calls are mocked
- **Services**: Service methods are mocked at controller level

Real implementations are tested in unit tests while integration tests verify controller/middleware behavior with mocked services.

## Adding New Tests

### 1. Create test file
```bash
touch tests/unit/new-feature.test.js
```

### 2. Import test helpers
```javascript
const { createMockRequest, createMockResponse } = require('../fixtures/test-helpers');
const { testUsers, testProjects } = require('../fixtures/test-data');
```

### 3. Write test suite
```javascript
describe('Feature', () => {
  it('should do something', async () => {
    // Arrange
    const req = createMockRequest({ /* options */ });
    const res = createMockResponse();

    // Act
    await controller.method(req, res);

    // Assert
    expect(res.json).toHaveBeenCalledWith(/* expected */);
  });
});
```

### 4. Run tests
```bash
npm test
```

## Debugging Tests

### Run single test
```bash
npm test -- auth.controller.test.js
```

### Run with verbose output
```bash
npm test -- --verbose
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/backend/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## CI/CD Integration

For GitHub Actions or other CI systems, use:
```bash
npm test -- --coverage --watchAll=false
```

This will:
- Run all tests once
- Generate coverage report
- Exit with appropriate code

## Continuous Testing

Watch for changes and re-run tests:
```bash
npm run test:watch
```

## Troubleshooting

### Tests timeout
Increase timeout in test file:
```javascript
jest.setTimeout(15000);
```

### Database mocks not working
Ensure `tests/setup.js` is running:
```bash
npm test -- --showConfig
```

### Coverage not meeting threshold
Run coverage analysis:
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

## Best Practices

1. **Test names should be descriptive**
   ```javascript
   ✅ it('should reject registration with duplicate email')
   ❌ it('should fail on duplicate')
   ```

2. **Use arrange-act-assert pattern**
   ```javascript
   // Arrange
   const data = { /* setup */ };
   
   // Act
   const result = await function(data);
   
   // Assert
   expect(result).toBe(expected);
   ```

3. **Mock external dependencies**
   - Database calls
   - API calls
   - File system operations

4. **Test both success and failure paths**
   - Valid inputs
   - Invalid inputs
   - Edge cases
   - Error conditions

5. **Keep tests isolated**
   - Clear mocks after each test
   - Don't depend on test execution order
   - Use separate data for each test

## References

- [Jest Documentation](https://jestjs.io/)
- [Supertest](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

## Support

For questions or issues with tests, contact the development team or check the main README.md.
