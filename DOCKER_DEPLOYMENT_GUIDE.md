# 🐳 Docker Deployment Guide - School Management System

> **Status**: Production-Ready ✅

## 📋 Contents
1. [Local Docker Development](#local-docker-development)
2. [Docker Hub Build & Push](#docker-hub-buildpush)
3. [Docker Compose Production Setup](#docker-compose-production-setup)
4. [Security Best Practices](#security-best-practices)
5. [Troubleshooting](#troubleshooting)

---

## 🏠 Local Docker Development

### Prerequisites
- Docker Desktop installed (for Mac/Windows) or Docker + Docker Compose (for Linux)
- `.env` file configured with credentials

### Quick Start

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your credentials
nano .env

# 3. Build and run with Docker Compose
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. View logs
docker-compose logs -f app

# 6. Access application
curl http://localhost:8080/swagger-ui.html
```

### Environment Setup

```bash
# Copy and customize
cp .env.example .env

# Edit with your values
vim .env

# Content:
DB_URL=jdbc:postgresql://postgres:5432/managmentSystemSchool
DB_USERNAME=postgres
DB_PASSWORD=secure_password_here
JWT_SECRET=$(openssl rand -base64 32)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
OAUTH2_REDIRECT_URL=http://localhost:5173/oauth2/redirect
```

### Stop & Clean Up

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (careful - deletes database!)
docker-compose down -v

# View container logs
docker-compose logs postgres
docker-compose logs app

# Rebuild without cache
docker-compose up -d --build
```

---

## 🐳 Docker Hub Build & Push

### 1. Create Docker Hub Account
- Go to [hub.docker.com](https://hub.docker.com)
- Create free account
- Create repository (e.g., `yourusername/school-management-api`)

### 2. Build & Push Image

```bash
# Login to Docker Hub
docker login

# Build image with tag
docker build -t yourusername/school-management-api:1.0.0 .

# Tag as latest
docker tag yourusername/school-management-api:1.0.0 yourusername/school-management-api:latest

# Push to Docker Hub
docker push yourusername/school-management-api:1.0.0
docker push yourusername/school-management-api:latest

# Verify on Docker Hub
# Visit: https://hub.docker.com/r/yourusername/school-management-api
```

### 3. Pull & Run from Docker Hub

```bash
# Pull image
docker pull yourusername/school-management-api:1.0.0

# Run with environment variables
docker run -d \
  --name school-app \
  -p 8080:8080 \
  -e DB_URL=jdbc:postgresql://host.docker.internal:5433/managmentSystemSchool \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=your_password \
  -e JWT_SECRET=your_secret \
  -e GOOGLE_CLIENT_ID=your_id \
  -e GOOGLE_CLIENT_SECRET=your_secret \
  -e OAUTH2_REDIRECT_URL=https://yourdomain.com/oauth2/redirect \
  yourusername/school-management-api:1.0.0
```

---

## 🏭 Docker Compose Production Setup

### Enhanced docker-compose for Production

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:14-alpine
    container_name: school-db-prod
    restart: always
    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: managmentSystemSchool
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - school-network

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: school-app-prod
    restart: always
    ports:
      - "8080:8080"
    environment:
      DB_URL: ${DB_URL}
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      OAUTH2_REDIRECT_URL: ${OAUTH2_REDIRECT_URL}
      PORT: 8080
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - school-network

volumes:
  postgres_data:
    driver: local

networks:
  school-network:
    driver: bridge
```

---

## 🔒 Security Best Practices

### ✅ DO's

```bash
# ✅ Use strong JWT secret
export JWT_SECRET=$(openssl rand -base64 32)

# ✅ Use environment variables for credentials
export DB_PASSWORD="secure_password_here"

# ✅ Update redirect URI for production
export OAUTH2_REDIRECT_URL="https://yourdomain.com/oauth2/redirect"

# ✅ Use HTTPS in production
# Update application.properties or set environment variable

# ✅ Limit container resources
docker run -m 512m --cpus 1 ...
```

### ❌ DON'Ts

```bash
# ❌ Don't hardcode credentials in Dockerfile
# ❌ Don't commit .env to git
# ❌ Don't use weak JWT secrets
# ❌ Don't run as root in container
# ❌ Don't expose database port publicly
# ❌ Don't use default passwords
```

### Security Checklist

- [ ] No credentials in Dockerfile
- [ ] No .env file in git (add to .gitignore)
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] HTTPS enabled for production
- [ ] Database password changed from default
- [ ] OAuth2 redirect URI updated for production
- [ ] Database backups configured
- [ ] Logs aggregated and monitored

---

## 🚀 Production Deployment Checklist

```bash
# 1. Prepare environment
cp .env.example .env
# Edit .env with production values

# 2. Build image
docker build -t school-api:prod .

# 3. Run with resource limits
docker run -d \
  --name school-app \
  -m 1g \
  --cpus 2 \
  -p 8080:8080 \
  --restart unless-stopped \
  --env-file .env \
  school-api:prod

# 4. Verify health
curl http://localhost:8080/swagger-ui.html

# 5. Check logs
docker logs school-app

# 6. Monitor
docker stats school-app
```

---

## 🛠️ Troubleshooting

### Issue: Container exits immediately

```bash
# Check logs
docker logs school-app

# Common causes:
# - Database connection failed
# - Invalid environment variables
# - Port already in use
```

### Issue: Database connection refused

```bash
# Verify database is running
docker-compose ps

# Check database container logs
docker-compose logs postgres

# Test connection
docker exec school-db-prod psql -U postgres -c "SELECT 1"
```

### Issue: Out of memory

```bash
# Increase memory limit
docker run -m 2g ...

# Check memory usage
docker stats
```

### Issue: Port already in use

```bash
# Change port
docker run -p 9090:8080 ...

# Or kill existing service
sudo lsof -ti:8080 | xargs kill -9
```

---

## 📊 Monitoring & Logs

### View Logs

```bash
# Real-time logs
docker-compose logs -f

# Specific service
docker-compose logs app
docker-compose logs postgres

# Last 100 lines
docker logs --tail 100 school-app

# Follow with timestamps
docker logs -f --timestamps school-app
```

### Performance Monitoring

```bash
# Check resource usage
docker stats

# Inspect container
docker inspect school-app

# View processes inside container
docker top school-app
```

---

## 🔄 Version Updates

### Update Application

```bash
# 1. Stop current container
docker-compose down

# 2. Update code
git pull origin main

# 3. Rebuild image
docker-compose up -d --build

# 4. Verify
docker-compose logs app
```

### Rollback

```bash
# Keep previous image tag
docker tag school-api:prod school-api:prod-v1
docker push school-api:prod-v1

# Rollback if needed
docker run -d --name school-app-rollback \
  -e-file .env \
  school-api:prod-v1
```

---

## 📚 Useful Docker Commands

```bash
# Build image
docker build -t school-api:latest .

# Run container
docker run -d -p 8080:8080 school-api:latest

# Stop container
docker stop school-app

# Remove container
docker rm school-app

# List images
docker images

# Remove image
docker rmi school-api:latest

# Push to registry
docker push yourusername/school-api:latest

# Pull from registry
docker pull yourusername/school-api:latest
```

---

## 📖 Additional Resources

- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Spring Boot with Docker](https://spring.io/guides/gs/spring-boot-docker/)

---

**Last Updated**: June 2, 2026  
**Status**: Production Ready ✅

