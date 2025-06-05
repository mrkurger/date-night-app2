/**
 * Type-safe request accessor for body, params, and query properties
 */
export function getRequestData(req, property) {
  // Type-safe accessor with runtime checks
  if (property === 'body' && req.body) return req.body;
  if (property === 'params' && req.params) return req.params;
  if (property === 'query' && req.query) return req.query;
  return undefined;
}

/**
 * Type-safe request setter for body, params, and query properties
 */
export function setRequestData(req, property, value) {
  if (property === 'body') req.body = value;
  else if (property === 'params') req.params = value;
  else if (property === 'query') req.query = value;
}
