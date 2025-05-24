/**
 * MCP Servers Index
 * 
 * Entry point for all MCP (Model Context Protocol) servers.
 */
import mongodbMcp from './mongodb/mongodb.mcp.js';

/**
 * Initialize all MCP servers
 */
export const initializeMcpServers = async () => {
  try {
    console.log('Initializing MCP servers...');
    
    // Initialize MongoDB MCP
    await mongodbMcp.initialize();
    
    console.log('All MCP servers initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize MCP servers:', error);
    return false;
  }
};

/**
 * Shutdown all MCP servers
 */
export const shutdownMcpServers = async () => {
  try {
    console.log('Shutting down MCP servers...');
    
    // Shutdown MongoDB MCP
    await mongodbMcp.shutdown();
    
    console.log('All MCP servers shut down successfully');
    return true;
  } catch (error) {
    console.error('Error shutting down MCP servers:', error);
    return false;
  }
};

export { mongodbMcp };

export default {
  initializeMcpServers,
  shutdownMcpServers,
  mongodbMcp,
};