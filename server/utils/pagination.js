/**
 * Pagination utility for API endpoints
 * Handles pagination parameters and formatting of paginated responses
 */

/**
 * Parse pagination parameters from request query
 * @param {Object} query - Express request query object
 * @returns {Object} Pagination parameters
 */
const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const maxLimit = 100; // Maximum allowed limit
  
  return {
    page: Math.max(1, page), // Ensure page is at least 1
    limit: Math.min(Math.max(1, limit), maxLimit), // Ensure limit is between 1 and maxLimit
    skip: (Math.max(1, page) - 1) * Math.min(Math.max(1, limit), maxLimit)
  };
};

/**
 * Create a paginated response
 * @param {Array} data - Data to paginate
 * @param {number} totalItems - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {string} baseUrl - Base URL for pagination links
 * @returns {Object} Paginated response
 */
const createPaginatedResponse = (data, totalItems, page, limit, baseUrl = '') => {
  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  // Build pagination links
  const links = {};
  
  if (baseUrl) {
    if (hasNextPage) {
      links.next = `${baseUrl}?page=${page + 1}&limit=${limit}`;
    }
    
    if (hasPrevPage) {
      links.prev = `${baseUrl}?page=${page - 1}&limit=${limit}`;
    }
    
    links.first = `${baseUrl}?page=1&limit=${limit}`;
    links.last = `${baseUrl}?page=${totalPages}&limit=${limit}`;
  }
  
  return {
    data,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage
    },
    links
  };
};

module.exports = {
  getPaginationParams,
  createPaginatedResponse
};