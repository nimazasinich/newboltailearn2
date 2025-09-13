# Contributing to Persian Legal AI Training System

Thank you for your interest in contributing to the Persian Legal AI Training System! This document provides guidelines and standards for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Development Setup
```bash
# Clone the repository
git clone https://github.com/nimazasinich/newboltailearn.git
cd newboltailearn

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run the development server
npm run dev
```

## 📋 Development Workflow

### 1. Code Quality Standards

#### TypeScript
- **Strict Mode**: All TypeScript code must use strict mode
- **Type Safety**: Avoid `any` types; use explicit types or proper type assertions
- **ES Modules**: Use ES module syntax (`import`/`export`) throughout
- **Type Definitions**: Define proper interfaces and types for all data structures

#### ESLint Configuration
- **Modern Flat Config**: Uses the new ESLint flat configuration format
- **TypeScript Rules**: Enforces TypeScript-specific linting rules
- **Code Style**: Consistent code formatting and style enforcement

```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

#### Code Structure
- **Server Files**: All backend code in `server/` directory as `.ts` files
- **Frontend Files**: React components in `src/` directory
- **Test Files**: Tests in `tests/` directory with proper naming conventions
- **Database**: SQLite with parameterized queries for security

### 2. Testing Requirements

#### Test Coverage
- **API Tests**: All API endpoints must have comprehensive tests
- **Authentication Tests**: JWT authentication and role-based access control
- **Database Tests**: Database operations with test database isolation
- **Integration Tests**: End-to-end functionality testing
- **Stress Tests**: Performance and load testing for critical operations

#### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm test -- tests/api/
npm test -- tests/stress/
```

#### Test Writing Guidelines
- Use descriptive test names that explain the expected behavior
- Test both success and failure scenarios
- Use proper test data setup and teardown
- Mock external dependencies appropriately
- Follow AAA pattern: Arrange, Act, Assert

### 3. Security Guidelines

#### Authentication & Authorization
- **JWT Tokens**: Use JWT for authentication with proper secret management
- **Role-based Access**: Implement proper role hierarchy (admin > trainer > viewer > user)
- **Password Security**: Use bcryptjs for password hashing with appropriate salt rounds
- **Input Validation**: Validate and sanitize all user inputs

#### Database Security
- **Parameterized Queries**: Always use parameterized queries to prevent SQL injection
- **Environment Variables**: Store sensitive data in environment variables
- **Token Management**: Properly encode and decode HuggingFace tokens

### 4. API Development

#### RESTful Design
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Follow RESTful URL patterns
- Return appropriate HTTP status codes
- Include proper error handling and messages

#### Authentication Middleware
```typescript
// Protect sensitive routes
app.post('/api/models/:id/train', requireAuth, requireRole('trainer'), trainModelHandler);

// Use proper middleware order
app.use('/api/protected', requireAuth);
app.use('/api/admin', requireAuth, requireRole('admin'));
```

#### Error Handling
- Use consistent error response format
- Include proper error codes and messages
- Log errors appropriately
- Handle edge cases gracefully

### 5. Database Development

#### Schema Design
- Use proper foreign key relationships
- Include appropriate constraints and checks
- Use meaningful table and column names
- Include proper indexes for performance

#### Migration Strategy
- Document all schema changes
- Use version-controlled migration scripts
- Test migrations on test data
- Backup data before major changes

### 6. Frontend Development

#### React Best Practices
- Use functional components with hooks
- Implement proper error boundaries
- Use TypeScript for all components
- Follow React best practices for performance

#### Persian RTL Support
- Ensure proper RTL layout support
- Use appropriate Persian fonts and styling
- Test with Persian text content
- Maintain responsive design

## 🔄 Pull Request Process

### 1. Before Submitting
- [ ] Run `npm run lint` and fix all issues
- [ ] Run `npm test` and ensure all tests pass
- [ ] Run `npm run type-check` and fix type errors
- [ ] Test your changes thoroughly
- [ ] Update documentation if needed

### 2. Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Security
- [ ] No sensitive data exposed
- [ ] Authentication/authorization properly implemented
- [ ] Input validation in place

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### 3. Review Process
- All PRs require at least one review
- Security-related changes require additional review
- Breaking changes require discussion and approval
- Tests must pass before merging

## 🐛 Bug Reports

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Ubuntu 20.04]
- Node.js version: [e.g., 18.17.0]
- npm version: [e.g., 9.6.7]

## Additional Context
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template
```markdown
## Feature Description
Clear description of the requested feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other approaches you've considered

## Additional Context
Any other relevant information
```

## 📚 Code Documentation

### Inline Comments
- Document complex business logic
- Explain non-obvious code decisions
- Include JSDoc comments for functions and classes
- Document API endpoints with proper descriptions

### README Updates
- Update README.md for new features
- Include setup instructions for new dependencies
- Document new environment variables
- Update API endpoint documentation

## 🏗️ Architecture Guidelines

### Server Architecture
- Keep business logic separate from route handlers
- Use proper middleware for cross-cutting concerns
- Implement proper error handling middleware
- Use dependency injection where appropriate

### Database Architecture
- Use proper database transactions for multi-step operations
- Implement proper connection pooling
- Use prepared statements for performance
- Include proper logging for database operations

### Frontend Architecture
- Use proper state management patterns
- Implement proper error handling
- Use custom hooks for reusable logic
- Follow component composition patterns

## 🔧 Development Tools

### Recommended VS Code Extensions
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- GitLens
- REST Client (for API testing)

### Development Scripts
```bash
# Development
npm run dev          # Start frontend dev server
npm run server       # Start backend server
npm run build        # Build for production

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 📞 Getting Help

- **Documentation**: Check the README.md and this CONTRIBUTING.md
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Code Review**: Ask for help in pull request comments

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Persian Legal AI Training System! 🚀