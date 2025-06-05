import { z } from 'zod';
import { zodSchemas } from '../../utils/validation-utils.js';
// Import validateWithZod function correctly
import { validateWithZod } from '../../middleware/validator.js';

// Schema for password change request
const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: zodSchemas.password,
  }),
});

// Export validation middleware
export const validatePasswordChange = validateWithZod(changePasswordSchema);

// Export all schemas
export const UserSchemas = {
  changePassword: changePasswordSchema,
};

export default UserSchemas;
