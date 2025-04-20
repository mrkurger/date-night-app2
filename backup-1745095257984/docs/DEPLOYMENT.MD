# Deployment Guide

This guide provides detailed instructions for deploying the Date Night App to various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Development Environment](#development-environment)
- [Staging Environment](#staging-environment)
- [Production Environment](#production-environment)
- [Deployment Platforms](#deployment-platforms)
  - [AWS Deployment](#aws-deployment)
  - [Google Cloud Platform](#google-cloud-platform)
  - [Azure Deployment](#azure-deployment)
  - [Heroku Deployment](#heroku-deployment)
  - [Digital Ocean Deployment](#digital-ocean-deployment)
- [Continuous Integration/Continuous Deployment](#continuous-integrationcontinuous-deployment)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying the Date Night App, ensure you have the following:

- Node.js v22.14.0 or later
- npm v10.9.2 or later
- MongoDB v6.0 or later
- Git
- Docker and Docker Compose (for containerized deployments)
- Kubernetes CLI (for production deployments)
- Access to the deployment platform of your choice

## Environment Configuration

The Date Night App uses environment variables for configuration. Create appropriate `.env` files for each environment:

### Server Environment Variables

| Variable                 | Description                                    | Required       | Example                                                 |
| ------------------------ | ---------------------------------------------- | -------------- | ------------------------------------------------------- |
| `NODE_ENV`               | Environment (development, staging, production) | Yes            | `production`                                            |
| `PORT`                   | Port for the server to listen on               | Yes            | `3000`                                                  |
| `MONGODB_URI`            | MongoDB connection string                      | Yes            | `mongodb+srv://user:pass@cluster.mongodb.net/datenight` |
| `JWT_SECRET`             | Secret for JWT token generation                | Yes            | `your-secret-key`                                       |
| `JWT_REFRESH_SECRET`     | Secret for JWT refresh token                   | Yes            | `your-refresh-secret`                                   |
| `JWT_EXPIRATION`         | JWT token expiration time                      | Yes            | `1h`                                                    |
| `JWT_REFRESH_EXPIRATION` | JWT refresh token expiration                   | Yes            | `7d`                                                    |
| `CORS_ORIGIN`            | Allowed CORS origins                           | Yes            | `https://datenight.io`                                  |
| `STRIPE_SECRET_KEY`      | Stripe API secret key                          | For payments   | `sk_live_...`                                           |
| `STRIPE_WEBHOOK_SECRET`  | Stripe webhook secret                          | For payments   | `whsec_...`                                             |
| `AWS_ACCESS_KEY_ID`      | AWS access key for S3                          | For S3 storage | `AKIA...`                                               |
| `AWS_SECRET_ACCESS_KEY`  | AWS secret key for S3                          | For S3 storage | `your-secret`                                           |
| `AWS_REGION`             | AWS region for S3                              | For S3 storage | `us-east-1`                                             |
| `AWS_S3_BUCKET`          | AWS S3 bucket name                             | For S3 storage | `datenight-media`                                       |
| `SMTP_HOST`              | SMTP server host                               | For emails     | `smtp.example.com`                                      |
| `SMTP_PORT`              | SMTP server port                               | For emails     | `587`                                                   |
| `SMTP_USER`              | SMTP server username                           | For emails     | `user@example.com`                                      |
| `SMTP_PASS`              | SMTP server password                           | For emails     | `password`                                              |
| `EMAIL_FROM`             | Email sender address                           | For emails     | `noreply@datenight.io`                                  |
| `GOOGLE_MAPS_API_KEY`    | Google Maps API key                            | For maps       | `your-api-key`                                          |
| `LOG_LEVEL`              | Logging level                                  | No             | `info`                                                  |
| `RATE_LIMIT_WINDOW_MS`   | Rate limiting window in ms                     | No             | `900000`                                                |
| `RATE_LIMIT_MAX`         | Max requests per window                        | No             | `100`                                                   |

### Client Environment Variables

Create environment files in `client-angular/src/environments/`:

| Variable           | Description                | Required     | Example                           |
| ------------------ | -------------------------- | ------------ | --------------------------------- |
| `production`       | Production mode flag       | Yes          | `true`                            |
| `apiUrl`           | API server URL             | Yes          | `https://api.datenight.io/api/v1` |
| `socketUrl`        | Socket.IO server URL       | Yes          | `https://api.datenight.io`        |
| `googleMapsApiKey` | Google Maps API key        | For maps     | `your-api-key`                    |
| `encryptionKey`    | Client-side encryption key | For E2E chat | `your-encryption-key`             |
| `logLevel`         | Client logging level       | No           | `error`                           |

## Development Environment

### Local Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/date-night-app.git
   cd date-night-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` file in the server directory:

   ```bash
   cp server/.env.example server/.env
   ```

4. Create environment files for the client:

   ```bash
   cp client-angular/src/environments/environment.example.ts client-angular/src/environments/environment.ts
   ```

5. Start MongoDB:

   ```bash
   npm run mongodb
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Staging Environment

### Docker Compose Deployment

1. Build the Docker images:

   ```bash
   docker-compose build
   ```

2. Create a `.env.staging` file with appropriate values.

3. Start the services:

   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
   ```

4. Verify the deployment:
   ```bash
   docker-compose ps
   ```

## Production Environment

### Kubernetes Deployment

1. Build and push Docker images:

   ```bash
   docker build -t your-registry/datenight-client:latest ./client-angular
   docker build -t your-registry/datenight-server:latest ./server
   docker push your-registry/datenight-client:latest
   docker push your-registry/datenight-server:latest
   ```

2. Apply Kubernetes configurations:

   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/secrets.yaml
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/mongodb.yaml
   kubectl apply -f k8s/server.yaml
   kubectl apply -f k8s/client.yaml
   kubectl apply -f k8s/ingress.yaml
   ```

3. Verify the deployment:
   ```bash
   kubectl get pods -n datenight
   kubectl get services -n datenight
   kubectl get ingress -n datenight
   ```

## Deployment Platforms

### AWS Deployment

#### EC2 Deployment

1. Launch an EC2 instance with Amazon Linux 2.
2. Install Node.js, npm, and MongoDB.
3. Clone the repository and install dependencies.
4. Set up environment variables.
5. Build the client:
   ```bash
   cd client-angular
   npm run build:prod
   ```
6. Use PM2 to run the server:
   ```bash
   npm install -g pm2
   cd server
   pm2 start server.js --name datenight
   ```
7. Set up Nginx as a reverse proxy.

#### ECS Deployment

1. Create an ECS cluster.
2. Create task definitions for the client and server.
3. Create ECS services for the client and server.
4. Set up an Application Load Balancer.
5. Configure security groups and IAM roles.

### Google Cloud Platform

#### Google Kubernetes Engine (GKE)

1. Create a GKE cluster:
   ```bash
   gcloud container clusters create datenight-cluster --num-nodes=3
   ```
2. Configure kubectl:
   ```bash
   gcloud container clusters get-credentials datenight-cluster
   ```
3. Apply Kubernetes configurations as described in the Kubernetes deployment section.

#### App Engine

1. Create `app.yaml` files for the client and server.
2. Deploy the server:
   ```bash
   cd server
   gcloud app deploy
   ```
3. Deploy the client:
   ```bash
   cd client-angular
   npm run build:prod
   gcloud app deploy
   ```

### Azure Deployment

#### Azure Kubernetes Service (AKS)

1. Create an AKS cluster:
   ```bash
   az aks create --resource-group myResourceGroup --name datenight-cluster --node-count 3
   ```
2. Configure kubectl:
   ```bash
   az aks get-credentials --resource-group myResourceGroup --name datenight-cluster
   ```
3. Apply Kubernetes configurations as described in the Kubernetes deployment section.

#### Azure App Service

1. Create App Service plans for the client and server.
2. Create App Services for the client and server.
3. Configure environment variables.
4. Deploy the applications using Azure DevOps or GitHub Actions.

### Heroku Deployment

1. Create Heroku apps for the client and server:
   ```bash
   heroku create datenight-client
   heroku create datenight-server
   ```
2. Add MongoDB add-on:
   ```bash
   heroku addons:create mongodb:hobby-dev --app datenight-server
   ```
3. Configure environment variables:
   ```bash
   heroku config:set NODE_ENV=production --app datenight-server
   # Set other environment variables
   ```
4. Deploy the server:
   ```bash
   git subtree push --prefix server heroku-server master
   ```
5. Deploy the client:
   ```bash
   cd client-angular
   npm run build:prod
   cd ..
   git subtree push --prefix client-angular/dist heroku-client master
   ```

### Digital Ocean Deployment

#### App Platform

1. Create a new app on Digital Ocean App Platform.
2. Connect your GitHub repository.
3. Configure the build and run commands.
4. Set environment variables.
5. Deploy the application.

#### Droplets

1. Create a Droplet with Node.js.
2. Install MongoDB.
3. Clone the repository and install dependencies.
4. Build the client.
5. Set up PM2 to run the server.
6. Configure Nginx as a reverse proxy.

## Continuous Integration/Continuous Deployment

### GitHub Actions

The repository includes GitHub Actions workflows for CI/CD:

1. `.github/workflows/ci.yml` - Runs tests and linting on pull requests.
2. `.github/workflows/cd-staging.yml` - Deploys to staging on merges to the develop branch.
3. `.github/workflows/cd-production.yml` - Deploys to production on merges to the main branch.

To use these workflows:

1. Set up secrets in your GitHub repository:

   - `DOCKER_USERNAME` and `DOCKER_PASSWORD` for Docker Hub access.
   - `KUBE_CONFIG` for Kubernetes access.
   - Environment-specific secrets for each deployment environment.

2. Configure the workflows as needed for your deployment platforms.

## Monitoring and Logging

### Monitoring

1. Set up Prometheus for metrics collection:

   ```bash
   kubectl apply -f k8s/prometheus.yaml
   ```

2. Set up Grafana for visualization:

   ```bash
   kubectl apply -f k8s/grafana.yaml
   ```

3. Import the provided dashboards in Grafana.

### Logging

1. Set up Elasticsearch, Fluentd, and Kibana (EFK stack):

   ```bash
   kubectl apply -f k8s/efk.yaml
   ```

2. Configure log retention policies.

3. Set up alerts for critical log events.

## Backup and Recovery

### Database Backups

1. Set up automated MongoDB backups:

   ```bash
   kubectl apply -f k8s/mongodb-backup.yaml
   ```

2. Configure backup retention policies.

3. Test backup restoration regularly.

### Disaster Recovery

1. Document disaster recovery procedures.

2. Set up cross-region replication for critical data.

3. Implement regular disaster recovery drills.

## Troubleshooting

### Common Issues

1. **Connection refused to MongoDB**:

   - Check MongoDB service status.
   - Verify network connectivity.
   - Check MongoDB credentials.

2. **JWT token issues**:

   - Verify JWT secrets are correctly set.
   - Check token expiration times.
   - Ensure clocks are synchronized.

3. **CORS errors**:

   - Verify CORS_ORIGIN environment variable.
   - Check for missing headers in requests.

4. **Image upload failures**:
   - Check S3 credentials and permissions.
   - Verify bucket exists and is accessible.
   - Check file size limits.

### Logs and Diagnostics

1. View server logs:

   ```bash
   kubectl logs -f deployment/datenight-server -n datenight
   ```

2. View client logs:

   ```bash
   kubectl logs -f deployment/datenight-client -n datenight
   ```

3. Check MongoDB logs:

   ```bash
   kubectl logs -f statefulset/mongodb-0 -n datenight
   ```

4. Check application health:
   ```bash
   kubectl exec -it deployment/datenight-server -n datenight -- curl localhost:3000/health
   ```

For more detailed troubleshooting, refer to the application logs and monitoring dashboards.
