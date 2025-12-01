<!-- db9b89e2-42a7-4e45-9d85-1536818c68ec b0fa9a34-647c-4fcd-96dd-aa0a499a4539 -->
# Flowise Runner - Headless API Service

Create a standalone headless API service in `/flowise-runner` that contains all Flowise API functionality without any UI components.

## Structure

Create the following folder structure:

```
flowise-runner/
├── src/
│   ├── index.ts                    # Main entry point (no UI serving)
│   ├── DataSource.ts               # Database initialization
│   ├── routes/                     # All API routes
│   ├── controllers/                # All controllers
│   ├── services/                   # All services
│   ├── database/                   # Entities and migrations
│   ├── utils/                      # Utility functions
│   ├── middlewares/                # Middleware
│   ├── enterprise/                 # Enterprise features (auth, SSO, RBAC)
│   ├── queue/                      # Queue management
│   ├── metrics/                     # Metrics providers
│   ├── api-documentation/           # Swagger/OpenAPI documentation
│   │   ├── configs/
│   │   │   └── swagger.config.ts   # Swagger configuration
│   │   └── yml/
│   │       └── swagger.yml         # OpenAPI specification
│   └── ...                         # Other server components
├── package.json                    # Standalone dependencies
├── tsconfig.json                   # TypeScript config
├── .env.example                    # Environment variables template
└── README.md                       # Documentation
```

## Implementation Steps

### 1. Create Base Structure

- Create `flowise-runner/` directory in root
- Set up `src/` directory structure
- Create `package.json` with all necessary dependencies from `packages/server/package.json`
- Create `tsconfig.json` based on server's TypeScript config

### 2. Copy Core Server Files

Copy the following from `packages/server/src/`:

- `DataSource.ts` - Database initialization (modify to use separate DB config)
- `index.ts` - Main app class (remove UI serving code)
- `routes/` - All route files
- `controllers/` - All controller files
- `services/` - All service files
- `database/` - Entities and migrations
- `utils/` - All utility files
- `middlewares/` - Middleware files
- `enterprise/` - Enterprise features directory
- `queue/` - Queue management
- `metrics/` - Metrics providers
- `IdentityManager.ts`
- `NodesPool.ts`
- `CachePool.ts`
- `AbortControllerPool.ts`
- `UsageCacheManager.ts`
- `StripeManager.ts`
- `Interface*.ts` files
- `errors/` directory

### 3. Copy and Integrate Swagger Documentation

Copy the following from `packages/api-documentation/src/`:

- `configs/swagger.config.ts` - Swagger configuration (modify server URL to use `FLOWISE_RUNNER_PORT` or default port)
- `yml/swagger.yml` - OpenAPI specification file

Modify `swagger.config.ts`:
- Update server URL in `servers` array to use the runner's port (default: 3001)
- Update `apis` paths to point to runner's route files
- Ensure paths resolve correctly in standalone build

### 4. Modify Main Entry Point

In `src/index.ts`:

- Remove UI static file serving (lines 330-343 in original)
- Remove `flowise-ui` dependency references
- Keep all API route mounting
- Keep all middleware setup
- Keep database initialization
- Keep enterprise features initialization
- Modify to not serve React app fallback
- **Add Swagger UI integration**: Mount Swagger UI at `/api-docs` route using `swagger-ui-express`
- Import and configure Swagger from `api-documentation/configs/swagger.config.ts`
- Ensure Swagger is accessible at `http://localhost:{PORT}/api-docs` (or configured port)

### 5. Create Standalone Package Configuration

- `package.json`: Copy dependencies from `packages/server/package.json`, remove `flowise-ui` and `flowise-components` workspace references, add direct dependencies
- **Add Swagger dependencies**: Include `swagger-jsdoc`, `swagger-ui-express`, `@types/swagger-jsdoc`, `@types/swagger-ui-express` from `packages/api-documentation/package.json`
- `tsconfig.json`: Create TypeScript config for standalone compilation
- Add build scripts for TypeScript compilation

### 6. Database Configuration

- Modify `DataSource.ts` to support separate database configuration
- Use environment variables for database connection (defaults to separate `.flowise-runner` directory)
- Ensure migrations can run independently

### 7. Startup Script

- Create `src/start.ts` or `bin/start.ts` for service startup
- Initialize database, configure app, start HTTP server
- No UI-related initialization
- **Log Swagger URL**: On startup, log the Swagger documentation URL (e.g., `Swagger API documentation available at http://localhost:3001/api-docs`)

### 8. Environment Configuration

- Create `.env.example` with all necessary environment variables
- Document database configuration options
- Document port and host configuration
- **Document Swagger**: Note that Swagger UI is available at `/api-docs` endpoint

### 9. Dependencies Management

- Include all runtime dependencies from server package
- Remove UI-related dependencies
- Ensure `flowise-components` is available (may need to reference or copy)
- Include all database drivers (sqlite3, mysql2, pg)
- Include all enterprise dependencies
- **Include Swagger dependencies**: `swagger-jsdoc`, `swagger-ui-express` and their TypeScript types

## Key Modifications

1. **Remove UI Serving**: Remove all code that serves static UI files or React app
2. **Database Path**: Default database path to `~/.flowise-runner/database.sqlite` (or configurable)
3. **Port Configuration**: Use `FLOWISE_RUNNER_PORT` env var (default 3001 to avoid conflicts)
4. **No UI Dependencies**: Remove `flowise-ui` from dependencies
5. **Standalone Build**: Configure to build independently without monorepo dependencies
6. **Swagger Integration**: Integrate Swagger UI directly into Express app at `/api-docs` route for interactive API documentation
   - Copy Swagger configuration and YAML files from `packages/api-documentation/`
   - Mount Swagger UI middleware in main Express app
   - Update Swagger config to use runner's port and route paths
   - Ensure Swagger is accessible for external API implementation

## Files to Reference (Not Copy Directly)

- `packages/server/src/index.ts` - Main app structure
- `packages/server/src/DataSource.ts` - Database setup
- `packages/server/src/routes/index.ts` - Route structure
- `packages/server/package.json` - Dependencies list
- `packages/server/tsconfig.json` - TypeScript config
- `packages/api-documentation/src/configs/swagger.config.ts` - Swagger configuration
- `packages/api-documentation/src/yml/swagger.yml` - OpenAPI specification
- `packages/api-documentation/src/index.ts` - Swagger UI setup example

## Testing Considerations

- Ensure all API endpoints work without UI
- Verify database migrations run correctly
- Test enterprise features (auth, SSO) if included
- Verify queue functionality if enabled
- Test with different database types (SQLite, PostgreSQL, MySQL)
- **Verify Swagger UI**: Test that `/api-docs` endpoint serves interactive API documentation
- **Test Swagger Integration**: Verify all API endpoints are properly documented in Swagger UI
- **External API Testing**: Use Swagger UI to test API endpoints for external integration

### To-dos

- [ ] Create flowise-runner directory structure with src/, package.json, tsconfig.json, and .env.example
- [ ] Copy all core server files (routes, controllers, services, database, utils, middlewares, enterprise, queue, metrics) from packages/server/src/
- [ ] Copy Swagger configuration files (swagger.config.ts and swagger.yml) from packages/api-documentation/src/
- [ ] Modify src/index.ts to remove UI serving code and React app fallback, keep all API routes
- [ ] Integrate Swagger UI at /api-docs route in src/index.ts
- [ ] Modify swagger.config.ts to use runner's port and correct route paths
- [ ] Modify DataSource.ts to use separate database path (~/.flowise-runner) and make it configurable
- [ ] Create standalone package.json with all dependencies, remove flowise-ui workspace reference, add Swagger dependencies
- [ ] Create tsconfig.json for standalone TypeScript compilation
- [ ] Create startup script (src/start.ts or bin/start.ts) to initialize and run the service, log Swagger URL
- [ ] Create .env.example with all necessary environment variables and documentation (including Swagger endpoint)
- [ ] Create README.md with setup instructions, configuration options, usage, and Swagger documentation URL

