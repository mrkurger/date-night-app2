/**
 * Validator wrapper to ensure backward compatibility
 */
import { validateWithZod, legacyValidateWithZod, enhancedValidateWithZod } from './validator-compat.js';

// Export all functions, maintaining backward compatibility
export { validateWithZod, legacyValidateWithZod, enhancedValidateWithZod };

export default { validateWithZod };
