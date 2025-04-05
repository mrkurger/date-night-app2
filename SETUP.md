# DateNight.io Setup Guide

This guide will help you set up and run the DateNight.io application on your local machine.

## Prerequisites

- Node.js (LTS version recommended, even-numbered versions like 18.x, 20.x, or 22.x)
- MongoDB (local installation or MongoDB Atlas account)
- Git

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd date-night-app
```

### 2. Run the Setup Script

We've created a setup script that will check your Node.js version, install all dependencies, and prepare the application for running:

#### On macOS/Linux:

```bash
chmod +x setup.sh
./setup.sh
```

#### On Windows:

```bash
setup.bat
```

#### Alternatively, you can run:

```bash
node setup.js
```

This script will:
- Check your Node.js version and provide guidance if you're using a non-LTS version
- Install all dependencies for the root project, server, and client
- Update package.json with any missing dependencies
- Install any missing dependencies

### 3. Configure Environment Variables

Create a `.env` file in the server directory:

```bash
cp server/.env.example server/.env
```

Edit the `.env` file to configure your environment variables:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/date-night-app

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# CORS Configuration
CLIENT_URL=http://localhost:4200

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880 # 5MB

# Email Configuration (if using email services)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@datenight.io
```

### 4. Start MongoDB

Ensure MongoDB is running on your machine. If you don't have MongoDB installed, you can use our script to check and start it:

```bash
npm run mongodb
```

### 5. Start the Application

To start both the server and client applications:

```bash
npm run dev
```

This will:
- Check your Node.js version
- Ensure MongoDB is running
- Install any missing dependencies
- Start the server on http://localhost:3000
- Start the Angular client on http://localhost:4200

## Troubleshooting

### Node.js Version Issues

If you're using an odd-numbered version of Node.js (like 19.x, 21.x, or 23.x), you'll receive a warning. These versions are not LTS (Long Term Support) and are not recommended for production use.

To switch to an LTS version:

#### Using nvm (Node Version Manager):

```bash
nvm install --lts
nvm use --lts
```

#### Manual Installation:

Download and install an LTS version from [Node.js official website](https://nodejs.org/en/download/).

### Missing Dependencies

If you encounter errors about missing dependencies, run:

```bash
npm run install-missing
```

### Angular Client Issues

If the Angular client fails to start with project determination errors, use:

```bash
cd client-angular
ng serve client-angular
```

Or from the root directory:

```bash
npm run start:client
```

### MongoDB Connection Issues

If you have issues connecting to MongoDB, ensure:

1. MongoDB is installed and running
2. Your connection string in the `.env` file is correct
3. If using MongoDB Atlas, your IP address is whitelisted

## Additional Scripts

- `npm run start:server` - Start only the server
- `npm run start:client` - Start only the Angular client
- `npm run test` - Run tests
- `npm run seed` - Seed the database with initial data

## Documentation

For more detailed documentation on the application's features and architecture, see:

- [Travel Module Documentation](server/docs/travel-module.md)
- [API Documentation](server/docs/api.md)
- [Requirements Specification](docs/requirements.md)# DateNight.io Setup Guide

This guide will help you set up and run the DateNight.io application on your local machine.

## Prerequisites

- Node.js (LTS version recommended, even-numbered versions like 18.x, 20.x, or 22.x)
- MongoDB (local installation or MongoDB Atlas account)
- Git

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd date-night-app
```

### 2. Run the Setup Script

We've created a setup script that will check your Node.js version, install all dependencies, and prepare the application for running:

```bash
npm run setup
```

This script will:
- Check your Node.js version and provide guidance if you're using a non-LTS version
- Install all dependencies for the root project, server, and client
- Update package.json with any missing dependencies
- Install any missing dependencies

### 3. Configure Environment Variables

Create a `.env` file in the server directory:

```bash
cp server/.env.example server/.env
```

Edit the `.env` file to configure your environment variables:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/date-night-app

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# CORS Configuration
CLIENT_URL=http://localhost:4200

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880 # 5MB

# Email Configuration (if using email services)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@datenight.io
```

### 4. Start MongoDB

Ensure MongoDB is running on your machine. If you don't have MongoDB installed, you can use our script to check and start it:

```bash
npm run mongodb
```

### 5. Start the Application

To start both the server and client applications:

```bash
npm run dev
```

This will:
- Check your Node.js version
- Ensure MongoDB is running
- Install any missing dependencies
- Start the server on http://localhost:3000
- Start the Angular client on http://localhost:4200

## Troubleshooting

### Node.js Version Issues

If you're using an odd-numbered version of Node.js (like 19.x, 21.x, or 23.x), you'll receive a warning. These versions are not LTS (Long Term Support) and are not recommended for production use.

To switch to an LTS version:

#### Using nvm (Node Version Manager):

```bash
nvm install --lts
nvm use --lts
```

#### Manual Installation:

Download and install an LTS version from [Node.js official website](https://nodejs.org/en/download/).

### Missing Dependencies

If you encounter errors about missing dependencies, run:

```bash
npm run install-missing
```

### Angular Client Issues

If the Angular client fails to start with project determination errors, use:

```bash
cd client-angular
ng serve client-angular
```

Or from the root directory:

```bash
npm run start:client
```

### MongoDB Connection Issues

If you have issues connecting to MongoDB, ensure:

1. MongoDB is installed and running
2. Your connection string in the `.env` file is correct
3. If using MongoDB Atlas, your IP address is whitelisted

## Additional Scripts

- `npm run start:server` - Start only the server
- `npm run start:client` - Start only the Angular client
- `npm run test` - Run tests
- `npm run seed` - Seed the database with initial data

## Documentation

For more detailed documentation on the application's features and architecture, see:

- [Travel Module Documentation](server/docs/travel-module.md)
- [API Documentation](server/docs/api.md)
- [Requirements Specification](docs/requirements.md)