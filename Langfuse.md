# Langfuse Setup Guide

This guide provides detailed instructions for installing and setting up Langfuse locally for LLM observability and insights in your Flowise application.

## What is Langfuse?

Langfuse is an open-source LLM observability platform that provides:
- **Tracing**: Track LLM calls, tokens, and costs
- **Analytics**: Monitor performance and usage patterns
- **Debugging**: Identify issues in your LLM workflows
- **Evaluation**: Test and compare different prompts/models

## Prerequisites

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **Git** (for cloning repositories)
- **PostgreSQL** (via Docker)

## Installation Methods

### Method 1: Docker Compose (Recommended)

This is the easiest way to get Langfuse running locally.

#### Step 1: Clone the Langfuse Repository

```bash
git clone https://github.com/langfuse/langfuse.git
cd langfuse
```

#### Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/langfuse"

# Langfuse Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: External services
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"
```

#### Step 3: Start Langfuse with Docker Compose

```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# Check if all services are running
docker-compose ps
```

#### Step 4: Initialize the Database

```bash
# Run database migrations
docker-compose exec langfuse-backend npx prisma migrate deploy

# Optional: Seed with sample data
docker-compose exec langfuse-backend npm run seed
```

#### Step 5: Access Langfuse

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Database**: localhost:5432

### Method 2: Manual Installation

For development or custom configurations.

#### Step 1: Set Up PostgreSQL

```bash
# Using Docker
docker run --name langfuse-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=langfuse \
  -p 5432:5432 \
  -d postgres:15
```

#### Step 2: Clone and Install Backend

```bash
git clone https://github.com/langfuse/langfuse.git
cd langfuse

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL
```

#### Step 3: Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Optional: Seed database
npm run seed
```

#### Step 4: Start Backend

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

#### Step 5: Set Up Frontend

```bash
# In a new terminal
cd langfuse/frontend
npm install
npm run dev
```

## Configuration

### Environment Variables

Key environment variables for local development:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/langfuse"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# API Configuration
LANGFUSE_PUBLIC_KEY="your-public-key"
LANGFUSE_SECRET_KEY="your-secret-key"

# Optional: External API Keys
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"
```

### Database Configuration

Langfuse uses PostgreSQL. For local development:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/langfuse"
```

## Integration with Flowise

### Step 1: Install Langfuse in Flowise

Langfuse is already included in Flowise components. You can use it in your flows by:

1. **Adding Langfuse Analytics Node**: Add the Langfuse Analytics node to your flow
2. **Configuring Credentials**: Set up your Langfuse API keys
3. **Connecting to Your Instance**: Point to your local Langfuse instance

### Step 2: Configure Langfuse Credentials

1. Go to **Credentials** in Flowise
2. Add **Langfuse API** credential
3. Enter your Langfuse configuration:
   - **Public Key**: From your Langfuse dashboard
   - **Secret Key**: From your Langfuse dashboard
   - **Base URL**: `http://localhost:3001` (for local instance)

### Step 3: Use in Your Flows

1. **Add Langfuse Analytics Node** to your flow
2. **Connect your LLM nodes** to the Langfuse node
3. **Configure the credential** you created
4. **Run your flow** - traces will appear in Langfuse

## Usage Examples

### Basic LLM Tracing

```javascript
// In your Flowise flow
const langfuse = new LangfuseAnalytics({
  publicKey: "your-public-key",
  secretKey: "your-secret-key",
  baseUrl: "http://localhost:3001"
});

// Your LLM calls will be automatically traced
```

### Custom Traces

```javascript
// Create custom traces
const trace = langfuse.trace({
  name: "my-custom-trace",
  input: { userInput: "Hello" },
  output: { response: "Hi there!" }
});
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker-compose restart postgres
```

#### 2. Port Conflicts

If ports 3000 or 3001 are in use:

```bash
# Check what's using the ports
lsof -i :3000
lsof -i :3001

# Kill processes if needed
kill -9 <PID>
```

#### 3. Migration Issues

```bash
# Reset database
docker-compose down -v
docker-compose up -d

# Re-run migrations
docker-compose exec langfuse-backend npx prisma migrate deploy
```

#### 4. Frontend Not Loading

```bash
# Check frontend logs
docker-compose logs langfuse-frontend

# Restart frontend
docker-compose restart langfuse-frontend
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs langfuse-backend
docker-compose logs langfuse-frontend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f langfuse-backend
```

## Development Workflow

### Making Changes

1. **Edit code** in your local repository
2. **Restart services** to pick up changes:
   ```bash
   docker-compose restart langfuse-backend
   docker-compose restart langfuse-frontend
   ```

### Database Management

```bash
# Access database directly
docker-compose exec postgres psql -U postgres -d langfuse

# Run Prisma commands
docker-compose exec langfuse-backend npx prisma studio
```

### Testing API

```bash
# Test API health
curl http://localhost:3001/api/public/health

# Test authentication
curl -X POST http://localhost:3001/api/public/ingestion \
  -H "Content-Type: application/json" \
  -d '{"trace": {"id": "test-123", "name": "test-trace"}}'
```

## Production Considerations

### Security

- Change default passwords
- Use strong secrets for NEXTAUTH_SECRET
- Configure proper CORS settings
- Set up SSL/TLS certificates

### Performance

- Use a production PostgreSQL instance
- Configure proper resource limits
- Set up monitoring and alerting
- Consider using a reverse proxy (nginx)

### Backup

```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres langfuse > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres langfuse < backup.sql
```

## Additional Resources

- **Official Documentation**: https://langfuse.com/docs
- **GitHub Repository**: https://github.com/langfuse/langfuse
- **Community Discord**: https://discord.gg/langfuse
- **Flowise Integration**: https://docs.flowiseai.com/configuration/langfuse

## Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting) above
2. Review the [official documentation](https://langfuse.com/docs)
3. Join the [Discord community](https://discord.gg/langfuse)
4. Open an issue on [GitHub](https://github.com/langfuse/langfuse/issues)

---

**Note**: This guide is for local development. For production deployments, refer to the official Langfuse deployment documentation.
