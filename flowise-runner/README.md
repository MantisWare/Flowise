# Flowise Runner

A standalone headless API service for Flowise that provides all Flowise API functionality without any UI components. Perfect for integrating Flowise APIs into external applications or building custom frontends.

## Features

- ✅ Complete Flowise API functionality
- ✅ Interactive Swagger API documentation
- ✅ Support for all database types (SQLite, PostgreSQL, MySQL, MariaDB)
- ✅ Enterprise features (authentication, SSO, RBAC)
- ✅ Queue management support
- ✅ Metrics support (Prometheus, OpenTelemetry)
- ✅ No UI dependencies - pure API service

## Quick Start

### Installation

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

2. Build the project:
```bash
npm run build
# or
pnpm build
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the server:
```bash
npm start
# or
pnpm start
```

The server will start on port `3001` by default (configurable via `FLOWISE_RUNNER_PORT`).

## API Documentation

### Swagger UI

Interactive API documentation is available at:

```
http://localhost:3001/api-docs
```

The Swagger UI provides:
- Complete API endpoint documentation
- Interactive API testing
- Request/response schemas
- Authentication testing

### API Endpoints

All Flowise API endpoints are available under `/api/v1/`:

- `/api/v1/chatflows` - Chatflow management
- `/api/v1/predictions` - Chat predictions
- `/api/v1/chatmessage` - Chat message management
- `/api/v1/credentials` - Credential management
- `/api/v1/tools` - Tool management
- And many more...

See the Swagger documentation for the complete API reference.

## Configuration

### Environment Variables

Key configuration options (see `.env.example` for complete list):

#### Server Configuration
- `FLOWISE_RUNNER_PORT` - Server port (default: 3001)
- `HOST` - Server host (optional)
- `CORS_ORIGINS` - CORS allowed origins (default: `*`)

#### Database Configuration
- `DATABASE_TYPE` - Database type: `sqlite`, `postgres`, `mysql`, or `mariadb` (default: `sqlite`)
- `DATABASE_PATH` - Database path for SQLite (default: `~/.flowise-runner`)
- `DATABASE_HOST` - Database host (for PostgreSQL/MySQL/MariaDB)
- `DATABASE_PORT` - Database port
- `DATABASE_NAME` - Database name
- `DATABASE_USER` - Database user
- `DATABASE_PASSWORD` - Database password

#### Storage Configuration
- `STORAGE_TYPE` - Storage type: `local`, `s3`, or `gcs`
- For S3: Configure `S3_STORAGE_*` variables
- For Google Cloud Storage: Configure `GOOGLE_CLOUD_STORAGE_*` variables

### Database Setup

By default, Flowise Runner uses SQLite and stores the database at `~/.flowise-runner/database.sqlite`.

For production, we recommend using PostgreSQL:

```env
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=flowise
DATABASE_USER=flowise
DATABASE_PASSWORD=your_password
```

## Development

### Development Mode

Run in watch mode for development:

```bash
npm run dev
# or
pnpm dev
```

This will automatically rebuild and restart the server on file changes.

### Building

```bash
npm run build
# or
pnpm build
```

## API Usage Examples

### Using cURL

```bash
# Health check
curl http://localhost:3001/health

# Get all chatflows (requires API key)
curl -H "X-API-KEY: your-api-key" http://localhost:3001/api/v1/chatflows

# Create a prediction
curl -X POST \
  -H "X-API-KEY: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"question": "Hello", "chatflowid": "your-chatflow-id"}' \
  http://localhost:3001/api/v1/predictions
```

### Using Swagger UI

1. Navigate to `http://localhost:3001/api-docs`
2. Click "Authorize" and enter your API key
3. Test endpoints directly from the browser

## Architecture

Flowise Runner is a headless version of Flowise that:

- Removes all UI serving code
- Maintains all API functionality
- Uses a separate database path (`~/.flowise-runner` by default)
- Runs on a separate port (3001 by default)
- Includes integrated Swagger documentation

## Differences from Full Flowise

| Feature | Flowise | Flowise Runner |
|---------|---------|----------------|
| UI | ✅ Included | ❌ Not included |
| API | ✅ | ✅ |
| Swagger Docs | Separate service | ✅ Integrated |
| Default Port | 3000 | 3001 |
| Database Path | `~/.flowise` | `~/.flowise-runner` |

## Troubleshooting

### Port Already in Use

If port 3001 is already in use, set a different port:

```env
FLOWISE_RUNNER_PORT=3002
```

### Database Connection Issues

- Check database credentials in `.env`
- Ensure database server is running
- Verify network connectivity
- Check database logs for errors

### Swagger Not Loading

- Ensure the server is running
- Check that port matches `FLOWISE_RUNNER_PORT`
- Verify no firewall blocking the port
- Check browser console for errors

## License

See LICENSE.md in the root Flowise repository.

## Support

For issues and questions:
- GitHub Issues: https://github.com/FlowiseAI/Flowise/issues
- Documentation: https://docs.flowiseai.com
- Email: support@flowiseai.com

