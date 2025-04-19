# MongoDB Troubleshooting Guide

This guide provides solutions for common MongoDB issues you might encounter while setting up and running the DateNight.io application.

## Table of Contents

- [Installation Issues](#installation-issues)
  - [Windows](#windows-installation-issues)
  - [macOS](#macos-installation-issues)
  - [Linux](#linux-installation-issues)
- [Connection Issues](#connection-issues)
  - [MongoDB Not Running](#mongodb-not-running)
  - [Authentication Failures](#authentication-failures)
  - [Connection String Format](#connection-string-format)
  - [Network Connectivity](#network-connectivity)
- [Performance Issues](#performance-issues)
  - [Slow Queries](#slow-queries)
  - [High Memory Usage](#high-memory-usage)
- [Data Issues](#data-issues)
  - [Data Corruption](#data-corruption)
  - [Missing Data](#missing-data)
- [Common Error Messages](#common-error-messages)
- [MongoDB Configuration](#mongodb-configuration)
- [Backup and Recovery](#backup-and-recovery)
- [Monitoring and Diagnostics](#monitoring-and-diagnostics)
- [Additional Resources](#additional-resources)

## Installation Issues

### Windows Installation Issues

#### Service Installation Failures

If MongoDB fails to install as a service:

1. Run Command Prompt as Administrator
2. Try reinstalling the service:

   ```bash
   "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --remove
   "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --install --serviceName "MongoDB" --serviceDisplayName "MongoDB" --dbpath="C:\data\db" --logpath="C:\data\log\mongod.log" --logappend
   ```

3. Start the service:

   ```bash
   net start MongoDB
   ```

#### Missing DLL Errors

If you encounter missing DLL errors:

1. Install the Visual C++ Redistributable for Visual Studio 2015-2022:
   - Download from [Microsoft's website](https://aka.ms/vs/17/release/vc_redist.x64.exe)
   - Run the installer

### macOS Installation Issues

#### Homebrew Installation Errors

If you encounter errors when installing MongoDB via Homebrew:

```bash
# Update Homebrew
brew update

# Clear Homebrew cache
brew cleanup

# Try reinstalling
brew install mongodb-community@6.0
```

#### Permission Issues

If you encounter permission issues:

```bash
# Fix permissions for the data directory
sudo chown -R $(whoami) /usr/local/var/mongodb
```

### Linux Installation Issues

#### Package Manager Errors

For Debian/Ubuntu:

```bash
# Fix package database
sudo apt-get update
sudo apt-get clean
sudo apt-get autoremove

# Reinstall MongoDB
sudo apt-get install -y mongodb-org
```

#### SELinux Issues

If SELinux is preventing MongoDB from starting:

```bash
# Check SELinux status
sestatus

# Allow MongoDB to access its directories
sudo semanage fcontext -a -t mongod_var_lib_t "/var/lib/mongo(/.*)?"
sudo semanage fcontext -a -t mongod_log_t "/var/log/mongodb(/.*)?"
sudo restorecon -Rv /var/lib/mongo
sudo restorecon -Rv /var/log/mongodb
```

## Connection Issues

### MongoDB Not Running

#### Check MongoDB Service Status

```bash
# Windows
sc query MongoDB

# macOS
brew services list

# Linux (systemd)
sudo systemctl status mongod

# Linux (init.d)
sudo service mongod status
```

#### Start MongoDB Service

```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community@6.0

# Linux (systemd)
sudo systemctl start mongod

# Linux (init.d)
sudo service mongod start
```

#### Manual Start for Debugging

```bash
# Start MongoDB with verbose logging
mongod --dbpath /path/to/data/directory --logpath /path/to/log/file --logappend --verbose
```

### Authentication Failures

#### Check Credentials

Verify that you're using the correct username and password in your connection string.

#### Reset User Password

If you've forgotten the password:

1. Start MongoDB without authentication:

   ```bash
   mongod --dbpath /path/to/data/directory --noauth
   ```

2. Connect to MongoDB:

   ```bash
   mongosh
   ```

3. Switch to the admin database:

   ```javascript
   use admin
   ```

4. Reset the user password:

   ```javascript
   db.changeUserPassword('username', 'newPassword');
   ```

   Or create a new user:

   ```javascript
   db.createUser({
     user: 'username',
     pwd: 'password',
     roles: [{ role: 'readWrite', db: 'datenight' }],
   });
   ```

### Connection String Format

The correct format for MongoDB connection strings is:

```
mongodb://[username:password@]host[:port]/database[?options]
```

Examples:

- Local MongoDB without authentication:

  ```
  mongodb://localhost:27017/datenight
  ```

- Local MongoDB with authentication:

  ```
  mongodb://username:password@localhost:27017/datenight
  ```

- MongoDB Atlas:
  ```
  mongodb+srv://username:password@cluster0.example.mongodb.net/datenight?retryWrites=true&w=majority
  ```

### Network Connectivity

#### Check Firewall Settings

Ensure that the MongoDB port (default: 27017) is open:

```bash
# Check if port 27017 is open
telnet localhost 27017

# Windows: Check firewall
netsh advfirewall firewall show rule name="MongoDB"

# Windows: Add firewall rule
netsh advfirewall firewall add rule name="MongoDB" dir=in action=allow protocol=TCP localport=27017

# Linux: Check firewall
sudo ufw status

# Linux: Allow MongoDB port
sudo ufw allow 27017/tcp
```

#### Check Binding IP

MongoDB might be configured to only accept connections from certain IP addresses. Check the MongoDB configuration file:

```bash
# Windows
notepad "C:\Program Files\MongoDB\Server\6.0\bin\mongod.cfg"

# macOS/Linux
nano /etc/mongod.conf
```

Look for the `net.bindIp` setting. It should include `127.0.0.1` for local connections and any other IPs you want to allow.

## Performance Issues

### Slow Queries

#### Identify Slow Queries

Enable the MongoDB profiler:

```javascript
// Enable profiling for queries slower than 100ms
db.setProfilingLevel(1, { slowms: 100 });

// Check profiling status
db.getProfilingStatus();

// View slow queries
db.system.profile.find().sort({ ts: -1 }).limit(10).pretty();
```

#### Create Indexes

Create indexes for frequently queried fields:

```javascript
// Create an index
db.collection.createIndex({ field: 1 });

// Create a compound index
db.collection.createIndex({ field1: 1, field2: -1 });

// Create a text index
db.collection.createIndex({ field: 'text' });
```

### High Memory Usage

#### Check Memory Usage

```bash
# Check MongoDB memory usage
db.serverStatus().mem
```

#### Optimize Memory Settings

Adjust the WiredTiger cache size in the MongoDB configuration file:

```yaml
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1 # Adjust based on available RAM
```

## Data Issues

### Data Corruption

#### Repair Database

```bash
# Repair database
mongod --dbpath /path/to/data/directory --repair
```

#### Validate Collections

```javascript
// Validate a collection
db.collection.validate();
```

### Missing Data

#### Check Queries

Ensure your queries are correct and include all necessary fields:

```javascript
// Instead of
db.collection.find({ field: value });

// Be more specific
db.collection.find({ field: value, status: { $ne: 'deleted' } });
```

#### Check Indexes

Ensure indexes are not causing query issues:

```javascript
// List indexes
db.collection.getIndexes();
```

## Common Error Messages

### "Connection refused"

- MongoDB is not running
- MongoDB is running on a different port
- Firewall is blocking the connection

Solution: Start MongoDB, check the port, or adjust firewall settings.

### "Authentication failed"

- Incorrect username or password
- User does not exist
- User does not have access to the database

Solution: Verify credentials, create the user, or grant appropriate permissions.

### "No primary found"

- MongoDB replica set is not properly configured
- Primary node is down

Solution: Check replica set status and ensure at least one primary node is available.

### "Disk space full"

- No space left on the device

Solution: Free up disk space or add more storage.

## MongoDB Configuration

### Configuration File Location

- Windows: `C:\Program Files\MongoDB\Server\6.0\bin\mongod.cfg`
- macOS: `/usr/local/etc/mongod.conf`
- Linux: `/etc/mongod.conf`

### Common Configuration Options

```yaml
# Network settings
net:
  port: 27017
  bindIp: 127.0.0.1

# Storage settings
storage:
  dbPath: /path/to/data/directory
  journal:
    enabled: true

# Security settings
security:
  authorization: enabled

# Logging settings
systemLog:
  destination: file
  path: /path/to/log/file
  logAppend: true
```

## Backup and Recovery

### Create a Backup

```bash
# Create a backup
mongodump --uri="mongodb://localhost:27017/datenight" --out=/path/to/backup/directory

# Create a backup with authentication
mongodump --uri="mongodb://username:password@localhost:27017/datenight" --out=/path/to/backup/directory
```

### Restore from Backup

```bash
# Restore a backup
mongorestore --uri="mongodb://localhost:27017/datenight" /path/to/backup/directory/datenight

# Restore a backup with authentication
mongorestore --uri="mongodb://username:password@localhost:27017/datenight" /path/to/backup/directory/datenight
```

## Monitoring and Diagnostics

### MongoDB Compass

MongoDB Compass is a graphical user interface for MongoDB that allows you to:

- Explore and visualize your data
- Run ad-hoc queries
- Analyze query performance
- Create and manage indexes

Download from [MongoDB Compass](https://www.mongodb.com/products/compass).

### MongoDB Atlas Monitoring

If you're using MongoDB Atlas, you can access monitoring tools from the Atlas dashboard:

- Real-time performance metrics
- Alerts and notifications
- Query profiling
- Database auditing

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB University](https://university.mongodb.com/) - Free online courses
- [MongoDB Community Forums](https://www.mongodb.com/community/forums/)
- [MongoDB Developer Center](https://www.mongodb.com/developer/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Cloud-hosted MongoDB service
