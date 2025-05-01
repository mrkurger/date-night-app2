/**
 * Tooltip Helper
 *
 * This script provides functions to add tooltips and links to function/method references
 * in HTML documentation files.
 */

/**
 * Adds tooltips and links to function/method references in HTML content
 * @param {string} html - The HTML content
 * @param {Object} glossaryEntries - Object mapping function names to their descriptions
 * @param {string} glossaryPath - Path to the glossary file
 * @returns {string} - HTML with tooltips and links added
 */
function addTooltipsAndLinks(html, glossaryEntries, glossaryPath) {
  // Find function/method references in the HTML
  // This regex looks for words that might be function names (camelCase or snake_case)
  const functionRegex =
    /\b([a-z][a-zA-Z0-9]*(?:[A-Z][a-zA-Z0-9]*)*|[a-z][a-z0-9]*(?:_[a-z][a-z0-9]*)*)\b/g;

  // Skip words inside code blocks, links, and existing tooltips
  const skipRegex = /<(code|pre|a|span class="tooltip")[\s\S]*?<\/\1>/g;

  // Split HTML into parts to skip and parts to process
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = skipRegex.exec(html)) !== null) {
    // Add the part before the match
    if (match.index > lastIndex) {
      parts.push({
        text: html.substring(lastIndex, match.index),
        process: true,
      });
    }

    // Add the match (to be skipped)
    parts.push({
      text: match[0],
      process: false,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add the remaining part
  if (lastIndex < html.length) {
    parts.push({
      text: html.substring(lastIndex),
      process: true,
    });
  }

  // Process each part
  const processedParts = parts.map(part => {
    if (!part.process) {
      return part.text;
    }

    // Add tooltips and links to function references
    return part.text.replace(functionRegex, match => {
      if (glossaryEntries[match]) {
        const description = glossaryEntries[match].description;
        const shortDesc =
          description.length > 100 ? description.substring(0, 100) + '...' : description;

        return `<span class="tooltip function-link" onclick="window.location.href='${glossaryPath}#${match}'">
          ${match}
          <span class="tooltip-text">${shortDesc}</span>
        </span>`;
      }

      return match;
    });
  });

  return processedParts.join('');
}

/**
 * Extracts glossary entries from a glossary HTML file
 * @param {string} glossaryHtml - The glossary HTML content
 * @returns {Object} - Object mapping function names to their descriptions
 */
function extractGlossaryEntries(glossaryHtml) {
  const entries = {};

  // Extract entries using regex
  const entryRegex =
    /<div class="glossary-entry" id="([^"]+)">\s*<h3>[^<]*<\/h3>[\s\S]*?<div class="entry-description">\s*<p>([^<]*)<\/p>/g;

  let match;
  while ((match = entryRegex.exec(glossaryHtml)) !== null) {
    const name = match[1];
    const description = match[2];

    entries[name] = {
      description: description,
    };
  }

  return entries;
}

// Export functions for use in other scripts
export { addTooltipsAndLinks, extractGlossaryEntries };
