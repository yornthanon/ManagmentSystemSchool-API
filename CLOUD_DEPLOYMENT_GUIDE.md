# ☁️ Cloud Deployment Guide - School Management System

This guide covers deploying to popular cloud platforms using Docker.

---

## 📋 Quick Comparison

| Platform | Difficulty | Cost | Best For |
|----------|-----------|------|----------|
| **Heroku** | ⭐ Easy | $$$$ | Quick deployments |
| **AWS EC2** | ⭐⭐⭐ Medium | $-$$ | Full control |
| **DigitalOcean** | ⭐⭐ Easy | $$ | Docker-friendly |
| **Google Cloud** | ⭐⭐⭐ Medium | $-$$ | Google integration |
| **Azure** | ⭐⭐⭐ Medium | $-$$ | Enterprise features |

---

## 🟣 Heroku Deployment (Easiest)

### Prerequisites
- Heroku CLI installed
- Heroku account (free tier available)
- Docker Hub account

### Step 1: Create Heroku App

```bash
# Login to Heroku
heroku login

# Create app
heroku create school-management-api

# Set buildpacks
heroku buildpacks:add heroku/docker-image
heroku buildpacks:add heroku/python --index 1
```

### Step 2: Set Environment Variables

```bash
# Set all environment variables
heroku config:set DB_URL="jdbc:postgresql://your-db-host:5432/managementdb"
heroku config:set DB_USERNAME="db_user"
heroku config:set DB_PASSWORD="secure_password"
heroku config:set JWT_SECRET="$(openssl rand -base64 32)"
heroku config:set GOOGLE_CLIENT_ID="your_id"
heroku config:set GOOGLE_CLIENT_SECRET="your_secret"
heroku config:set OAUTH2_REDIRECT_URL="https://school-management-api.herokuapp.com/oauth2/redirect"

# View settings
heroku config
```

### Step 3: Deploy

```bash
# Push to Heroku
git push heroku main

# View logs
heroku logs --tail

# Open app in browser
heroku open
```

### Step 4: Add PostgreSQL Database (if using free tier)

```bash
# Add Heroku Postgres
heroku addons:create heroku-postgresql:hobby-dev

# Check database URL
heroku config | grep DATABASE_URL
```

### Cost Estimate
- App dyno: $5-7/month (minimum)
- Database: $9/month (minimum)
- **Total**: ~$14-16/month

### Limitations
- No free tier anymore (was discontinued)
- Costs increase with usage
- Limited customization

---

## 🟠 AWS Deployment (Most Flexible)

### Architecture
```
Internet → ALB → ECS Cluster → Container
                 ↓
              RDS PostgreSQL
```

### Step 1: Create RDS Database

```bash
# Using AWS Console or CLI
aws rds create-db-instance \
  --db-instance-identifier school-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password "secure_password" \
  --allocated-storage 20 \
  --publicly-accessible
```

### Step 2: Push Image to ECR

```bash
# Create ECR repository
aws ecr create-repository --repository-name school-api

# Get ECR login
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t school-api:latest .
docker tag school-api:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/school-api:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/school-api:latest
```

### Step 3: Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster --cluster-name school-cluster

# Create task definition (JSON)
# school-task-definition.json
{
  "family": "school-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "school-app",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/school-api:latest",
      "portMappings": [{"containerPort": 8080}],
      "environment": [
        {"name": "DB_URL", "value": "jdbc:postgresql://school-db.xxxxx.us-east-1.rds.amazonaws.com:5432/managementdb"},
        {"name": "DB_USERNAME", "value": "postgres"},
        {"name": "PORT", "value": "8080"}
      ],
      "secrets": [
        {"name": "DB_PASSWORD", "valueFrom": "arn:aws:secretsmanager:..."},
        {"name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:..."}
      ]
    }
  ]
}

# Register task definition
aws ecs register-task-definition --cli-input-json file://school-task-definition.json
```

### Step 4: Create ECS Service

```bash
aws ecs create-service \
  --cluster school-cluster \
  --service-name school-api \
  --task-definition school-api:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### Cost Estimate
- EC2/Fargate: $10.36/month (minimal)
- RDS: $20-30/month
- **Total**: ~$30-40/month

---

## 💙 DigitalOcean Deployment (Recommended)

### Advantages
- Docker-native
- Simple pricing
- Good performance
- Excellent documentation

### Step 1: Create Droplet

```bash
# Using doctl CLI
doctl compute droplet create school-api \
  --region nyc1 \
  --image docker \
  --size s-1vcpu-1gb \
  --enable-backups

# Or use DigitalOcean Console
```

### Step 2: SSH into Droplet

```bash
# SSH to droplet
ssh root@your_droplet_ip

# Update system
apt update && apt upgrade -y

# Install Docker Compose
apt install docker-compose -y

# Add user to docker group
usermod -aG docker $USER
```

### Step 3: Deploy with Docker Compose

```bash
# Clone repository (or copy files)
git clone https://github.com/yourusername/school-management.git
cd school-management

# Create .env file with production values
nano .env

# Run Docker Compose
docker-compose up -d

# Verify
docker-compose ps
curl http://localhost:8080/swagger-ui.html
```

### Step 4: Setup Reverse Proxy (Nginx)

```bash
# Install Nginx
apt install nginx -y

# Create config file
sudo tee /etc/nginx/sites-available/school-api > /dev/null <<EOF
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/school-api /etc/nginx/sites-enabled/

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Setup HTTPS (Let's Encrypt)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Generate SSL certificate
certbot --nginx -d yourdomain.com

# Auto-renewal (done automatically)
systemctl enable certbot.timer
```

### Cost Estimate
- Droplet (1GB): $5/month
- Backups: +$1/month
- Domain: ~$12/year
- **Total**: ~$6/month

### Complete docker-compose Production File

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:14-alpine
    restart: always
    environment:
      POSTGRES_DB: managmentSystemSchool
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME}"]
      interval: 10s

  app:
    build: .
    restart: always
    ports:
      - "8080:8080"
    environment:
      DB_URL: "jdbc:postgresql://postgres:5432/managmentSystemSchool"
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      OAUTH2_REDIRECT_URL: ${OAUTH2_REDIRECT_URL}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
```

---

## 🟦 Google Cloud Deployment

### Using Cloud Run (Serverless)

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/school-api

# Deploy to Cloud Run
gcloud run deploy school-api \
  --image gcr.io/PROJECT_ID/school-api \
  --platform managed \
  --region us-central1 \
  --set-env-vars JWT_SECRET="your_secret" \
  --set-env-vars GOOGLE_CLIENT_ID="your_id"
```

---

## 📊 Cost Comparison

| Platform | Monthly Cost | Scalability | Control |
|----------|------------|-----------|---------|
| Heroku | $14-50 | ⭐⭐⭐⭐ | ⭐ |
| AWS | $30-100+ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| DigitalOcean | $6-30 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Google Cloud | $10-50 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Azure | $10-50 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🔐 Security Checklist for Production

- [ ] HTTPS enabled
- [ ] Environment variables stored securely (not in code)
- [ ] Database backups configured
- [ ] Firewall rules configured
- [ ] Auto-restart enabled
- [ ] Resource limits set
- [ ] Health checks configured
- [ ] Monitoring/logging enabled
- [ ] Regular security updates

---

## 🚨 Post-Deployment Steps

```bash
# 1. Test application
curl https://yourdomain.com/swagger-ui.html

# 2. Test OAuth2 flow
# Visit: https://yourdomain.com/oauth2/authorization/google

# 3. Create admin user
# Use API to create first admin user

# 4. Setup monitoring
# Configure alerts for errors and downtime

# 5. Backup database
# Setup automated daily backups

# 6. Monitor logs
# Check logs for errors regularly
```

---

**Recommendation**: Start with **DigitalOcean** for best balance of cost, ease, and control.

**Last Updated**: June 2, 2026

