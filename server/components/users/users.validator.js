import { z } from 'zod';
import { ValidationUtils } from '../../utils/validation-utils.js';

// Schema for password change request
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: ValidationUtils.zodSchemas.password,
});

// Export validation middleware
export const validatePasswordChange = ValidationUtils.validateWithZod(changePasswordSchema);

// Export all schemas
export const UserSchemas = {
  changePassword: changePasswordSchema,
};

export default UserSchemas;