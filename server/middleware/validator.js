const { validationResult, body } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Common validation chains
const validators = {
  message: body('message').trim().notEmpty().isLength({ max: 2000 }),
  userId: body('userId').isMongoId(),
  // Add more validators as needed
};

module.exports = { validate, validators };
