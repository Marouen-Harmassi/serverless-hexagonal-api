# Serverless Hexagonal API

A serverless API application with hexagonal architecture, deployed on AWS Lambda.

## Technologies Used

- Node.js 22 LTS
- TypeScript
- Serverless Framework v4
- AWS Lambda
- DynamoDB
- pnpm
- Vitest for testing

## Architecture

The project follows a hexagonal architecture (ports & adapters) with the following structure:

```
src/
├── application/      # Application services and use cases
├── domain/           # Business logic and interfaces
│   ├── entities/     # Domain entities
│   └── repositories/ # Repository Interfaces (ports)
├── infrastructure/   # Technical implementations
│   ├── adapters/     # Adapters implementations
│   ├── handlers/     # AWS Lambda handlers
│   └── repositories/ # Repository implementations
```

## Prerequisites

- Node.js 22
- pnpm
- AWS Account configured
- Serverless Framework CLI
- Docker (optional)

## Installation

```bash
pnpm install
```

## Available Commands

- `pnpm build` : Build app
- `pnpm lint` : Execute linter
- `pnpm format` : Execute prettier
- `pnpm dev` : Starts the local development server
- `pnpm test` : Runs unit tests
- `pnpm test:coverage` : Runs tests with coverage
- `pnpm build` : Builds the project
- `pnpm deploy` : Deploys the application to AWS
- `pnpm package` : Creates a package for deployment
- `pnpm offline` : Runs the server in offline mode for local testing

## API Endpoints

### Create a task

```http
POST /tasks
Content-Type: application/json

{
  "title": "My task",
  "description": "Task description",
  "status": "TODO"
}
```

### Get a task

```http
GET /tasks/{id}
```

## Docker Support

To run the application using Docker:

```bash
docker compose up -d
```

## Tests

Unit tests are written with Vitest. To run the tests:

```bash
pnpm test
```

## Deployment

To deploy the application to AWS:

```bash
pnpm deploy
```

## Best Practices

- Hexagonal architecture for separation of concerns
- Unit tests for business logic
- Data validation with Zod
- Centralized error handling
- Strict typing with TypeScript
- Clear and complete documentation
