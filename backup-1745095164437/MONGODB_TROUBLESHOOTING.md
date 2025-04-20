# MongoDB Troubleshooting Guide

This guide provides solutions for common MongoDB issues you might encounter while running the DateNight.io application.

## Common MongoDB Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| 48 | MongoDB failed to start due to permission issues or lock files | Run `npm run check-mongodb` followed by `npm run fix-mongodb` |
| 100 | MongoDB failed to connect | Check if MongoDB is running with `npm run mongodb` |
| 14 | MongoDB unauthorized access | Check your MongoDB credentials in `.env` file |

## Quick Fix Commands

We've added several scripts to help diagnose and fix MongoDB issues:

```bash
# Check MongoDB data directory permissions
npm run check-mongodb

# Fix common MongoDB issues (permissions, lock files, repair database)
npm run fix-mongodb

# Start MongoDB if it's not running
npm run mongodb

# Complete MongoDB setup and repair
npm run setup:mongodb
```

## Detailed Troubleshooting Steps

### 1. MongoDB Fails to Start (Exit Code 48)

This typically indicates permission issues with the data directory or a lock file from an improper shutdown.

**Solution:**

```bash
# First, check permissions
npm run check-mongodb

# Then fix MongoDB issues
npm run fix-mongodb
```

### 2. MongoDB Data Directory Permissions

If MongoDB can't access the data directory:

**On macOS/Linux:**

```bash
# Fix permissions
chmod -R 755 ./data/db

# If using a system MongoDB installation, you might need:
sudo chown -R $(whoami):$(id -gn) ./data/db
```

**On Windows:**

1. Right-click on the data directory
2. Select Properties > Security > Edit
3. Add your user with Full Control permissions
4. Apply changes

### 3. MongoDB Lock Files

If MongoDB didn't shut down properly, it might leave a lock file:

```bash
# Remove lock file
rm ./data/db/mongod.lock
```

### 4. Repair MongoDB Database

If the database files are corrupted:

```bash
# Repair database
mongod --repair --dbpath ./data/db
```

### 5. MongoDB Connection Issues

If your application can't connect to MongoDB:

1. Check if MongoDB is running: `npm run mongodb`
2. Verify the connection string in `.env` file
3. Check if the MongoDB port (default 27017) is accessible

### 6. MongoDB Version Compatibility

This application has been tested with MongoDB 4.4+. If you're using an older version, consider upgrading:

**On macOS (with Homebrew):**
```bash
brew upgrade mongodb-community
```

**On Windows/Linux:**
Download the latest version from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

## Advanced Troubleshooting

### MongoDB Logs

Check MongoDB logs for detailed error information:

```bash
# View MongoDB log
cat mongodb.log
```

### Database Backup and Restore

If you need to backup and restore your data:

```bash
# Backup
mongodump --out ./backup

# Restore
mongorestore ./backup
```

### Complete Reset

If all else fails, you can completely reset MongoDB:

```bash
# Remove data directory (WARNING: This will delete all data)
rm -rf ./data/db

# Create fresh data directory
mkdir -p ./data/db

# Fix permissions
chmod -R 755 ./data/db

# Start MongoDB
npm run mongodb
```

## Getting Help

If you continue to experience issues after trying these solutions, please:

1. Check the MongoDB documentation: https://docs.mongodb.com/
2. Search for your specific error message on Stack Overflow
3. Contact the DateNight.io support team with details about your environment and the exact error messages