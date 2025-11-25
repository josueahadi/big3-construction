/**
 * Test Fixtures - Mock data for testing
 */

// Test user data
const testUsers = {
  admin: {
    user_id: 1,
    email: 'admin@big3.com',
    password: 'hashed_password_123',
    role: 'Admin',
    worker_id: null,
    created_at: new Date('2024-01-01')
  },
  pm: {
    user_id: 2,
    email: 'pm@big3.com',
    password: 'hashed_password_456',
    role: 'PM',
    worker_id: 1,
    created_at: new Date('2024-01-02')
  },
  supervisor: {
    user_id: 3,
    email: 'supervisor@big3.com',
    password: 'hashed_password_789',
    role: 'Site Supervisor',
    worker_id: 2,
    created_at: new Date('2024-01-03')
  }
};

// Test registration data
const registrationData = {
  validAdmin: {
    email: 'newadmin@big3.com',
    password: 'SecurePass123!',
    role: 'Admin',
    worker_id: null
  },
  validPM: {
    email: 'newpm@big3.com',
    password: 'SecurePass456!',
    role: 'PM',
    worker_id: 1
  },
  invalidEmail: {
    email: 'invalid-email',
    password: 'SecurePass123!',
    role: 'Admin',
    worker_id: null
  },
  missingPassword: {
    email: 'test@big3.com',
    role: 'Admin',
    worker_id: null
  },
  weakPassword: {
    email: 'test@big3.com',
    password: 'weak',
    role: 'Admin',
    worker_id: null
  }
};

// Test login data
const loginData = {
  valid: {
    email: 'admin@big3.com',
    password: 'correct_password'
  },
  invalidEmail: {
    email: 'nonexistent@big3.com',
    password: 'any_password'
  },
  invalidPassword: {
    email: 'admin@big3.com',
    password: 'wrong_password'
  }
};

// Test project data
const testProjects = {
  project1: {
    project_id: 1,
    project_name: 'Downtown Office Complex',
    description: 'Large commercial office building',
    site_city: 'New York',
    site_location: 'Fifth Avenue',
    latitude: 40.7128,
    longitude: -74.0060,
    budget: 5000000,
    status: 'Active',
    start_date: new Date('2024-01-15'),
    expected_completion: new Date('2025-06-15'),
    client_id: 1,
    created_at: new Date('2024-01-01')
  },
  project2: {
    project_id: 2,
    project_name: 'Mall Renovation',
    description: 'Shopping mall renovation project',
    site_city: 'Los Angeles',
    site_location: 'Sunset Boulevard',
    latitude: 34.0522,
    longitude: -118.2437,
    budget: 3000000,
    status: 'Active',
    start_date: new Date('2024-02-01'),
    expected_completion: new Date('2025-08-01'),
    client_id: 2,
    created_at: new Date('2024-01-02')
  },
  project3: {
    project_id: 3,
    project_name: 'Residential Complex',
    description: 'Apartment complex development',
    site_city: 'Chicago',
    site_location: 'Michigan Avenue',
    latitude: 41.8781,
    longitude: -87.6298,
    budget: 2000000,
    status: 'Planning',
    start_date: new Date('2024-03-01'),
    expected_completion: new Date('2025-12-01'),
    client_id: 3,
    created_at: new Date('2024-01-03')
  }
};

// Test project creation payload
const projectCreationData = {
  valid: {
    project_name: 'New Office Building',
    description: 'Modern office space',
    site_city: 'Boston',
    site_location: 'Beacon Hill',
    latitude: 42.3601,
    longitude: -71.0589,
    budget: 4000000,
    status: 'Planning',
    start_date: '2024-03-01',
    expected_completion: '2025-09-01',
    client_id: 1
  },
  missingName: {
    description: 'Modern office space',
    site_city: 'Boston',
    latitude: 42.3601,
    longitude: -71.0589,
    budget: 4000000
  },
  invalidBudget: {
    project_name: 'New Office Building',
    description: 'Modern office space',
    site_city: 'Boston',
    latitude: 42.3601,
    longitude: -71.0589,
    budget: -1000000,
    status: 'Planning'
  },
  invalidCoordinates: {
    project_name: 'New Office Building',
    site_city: 'Boston',
    latitude: 95.0,
    longitude: -71.0589,
    budget: 4000000
  }
};

// Test JWT tokens
const testTokens = {
  adminToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiQWRtaW4iLCJ3b3JrZXJfaWQiOm51bGx9.admin_token_signature',
  pmToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJyb2xlIjoiUE0iLCJ3b3JrZXJfaWQiOjF9.pm_token_signature',
  supervisorToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJyb2xlIjoiU2l0ZSBTdXBlcnZpc29yIiwid29ya2VyX2lkIjoyfQ.supervisor_token_signature',
  expiredToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2NzAwMDAwMDB9.expired_token_signature',
  invalidToken: 'invalid.token.format'
};

// Geospatial test data
const geospatialTestData = {
  searches: [
    {
      lat: 40.7128,
      lng: -74.0060,
      radius: 50,
      description: 'Search near NYC'
    },
    {
      lat: 34.0522,
      lng: -118.2437,
      radius: 100,
      description: 'Search near LA'
    },
    {
      lat: 41.8781,
      lng: -87.6298,
      radius: 200,
      description: 'Search near Chicago'
    }
  ],
  invalidSearches: [
    {
      lat: 95.0,
      lng: -74.0060,
      radius: 50,
      description: 'Invalid latitude (too high)'
    },
    {
      lat: 40.7128,
      lng: -200.0,
      radius: 50,
      description: 'Invalid longitude (too low)'
    },
    {
      lat: 40.7128,
      lng: -74.0060,
      radius: -50,
      description: 'Negative radius'
    }
  ]
};

module.exports = {
  testUsers,
  registrationData,
  loginData,
  testProjects,
  projectCreationData,
  testTokens,
  geospatialTestData
};
