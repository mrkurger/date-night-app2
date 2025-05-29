#!/bin/bash

# Fix Jest import type syntax errors
# Remove problematic "import type { jest } from '@jest/globals';" lines

echo "Fixing Jest import type syntax in test files..."

# List of files with the problematic import (from our previous search)
files=(
    "tests/mocks/bcrypt.ts"
    "tests/unit/middleware/security.test.ts"
    "tests/unit/middleware/cache.test.ts"
    "tests/unit/middleware/mongo-sanitize.test.ts"
    "tests/unit/middleware/url-validator.test.ts"
    "tests/unit/middleware/cspNonce.test.ts"
    "tests/unit/middleware/authenticateToken.test.ts"
    "tests/unit/middleware/securityHeaders.fixed.test.ts"
    "tests/unit/middleware/securityHeaders.test.ts"
    "tests/unit/middleware/upload.test.ts"
    "tests/unit/middleware/errorHandler.test.ts"
    "tests/unit/middleware/roles.test.ts"
    "tests/unit/middleware/rateLimiter.test.ts"
    "tests/unit/middleware/auth.middleware.test.ts"
    "tests/unit/middleware/csrf.test.ts"
    "tests/unit/middleware/requestValidator.test.ts"
    "tests/unit/middleware/asyncHandler.test.ts"
    "tests/unit/middleware/validation.test.ts"
    "tests/unit/models/chat-room.model.test.ts"
    "tests/unit/models/paymentMethod.model.test.ts"
    "tests/unit/models/transaction.model.test.ts"
    "tests/unit/models/chat-attachment.schema.test.ts"
    "tests/unit/models/token-blacklist.model.test.ts"
    "tests/unit/models/favorite.model.test.ts"
    "tests/unit/models/wallet.model.test.ts"
    "tests/unit/models/ad.model.test.ts"
    "tests/unit/models/verification.model.test.ts"
    "tests/unit/models/location.model.test.ts"
    "tests/unit/models/review.model.test.ts"
    "tests/unit/models/user.model.test.ts"
    "tests/unit/models/chat-message.model.test.ts"
    "tests/unit/models/safety-checkin.model.test.ts"
    "tests/unit/validators/auth.validator.test.ts"
    "tests/unit/services/socket.service.test.ts"
    "tests/unit/services/geocoding.service.test.ts"
    "tests/unit/services/safety.service.test.ts"
    "tests/unit/services/message-cleanup.service.test.ts"
    "tests/unit/services/chat.service.test.ts"
    "tests/unit/services/ad.service.test.ts"
    "tests/unit/services/auth.service.test.ts"
    "tests/unit/services/wallet.service.test.ts"
    "tests/unit/services/payment.service.test.ts"
    "tests/unit/services/media.service.test.ts"
    "tests/helpers.ts"
    "tests/integration/controllers/location.controller.test.ts"
    "tests/integration/controllers/geocoding.controller.test.ts"
    "tests/integration/controllers/payment.controller.test.ts"
    "tests/integration/controllers/review.controller.test.ts"
    "tests/integration/controllers/safety.controller.test.ts"
    "tests/integration/controllers/favorite.controller.test.ts"
    "tests/integration/controllers/travel.controller.test.ts"
    "tests/setup.ts"
    "tests/performance/api.performance.test.ts"
)

# Counter for processed files
count=0

# Process each file
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing: $file"
        # Remove the problematic import type line
        sed -i '' '/^import type { jest } from '\''@jest\/globals'\'';$/d' "$file"
        ((count++))
    else
        echo "Warning: File not found: $file"
    fi
done

echo "Processed $count files"
echo "Jest import type syntax fix completed!"
