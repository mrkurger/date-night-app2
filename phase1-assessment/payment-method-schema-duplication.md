# Payment Method Schema Duplication Analysis

## Overview

There is significant duplication between the standalone `paymentMethod.model.js` and the embedded payment method schema in `wallet.model.js`. This document analyzes the duplication and proposes a refactoring strategy.

## Duplicated Code Areas

### Schema Structure

- Both define nearly identical payment method schemas with the same fields:
  - `type` with the same enum values: ['card', 'bank_account', 'crypto_address']
  - `provider` field
  - `isDefault` boolean field
  - Card details with the same structure (lastFour, brand, expiryMonth, expiryYear, tokenId)
  - Bank details with the same structure (accountType, lastFour, bankName, country, currency, tokenId)
  - Crypto details with the same structure (currency, address, network, memo)

### Differences

- The standalone model includes additional fields:
  - `walletId` and `userId` references
  - Additional indexes for better query performance
- The standalone model uses the mongoose timestamps option
- The embedded schema manually manages timestamps with createdAt and updatedAt fields

## Impact Analysis

### Complexity

- **Medium**: The duplication is straightforward but spans multiple files.

### Maintenance Burden

- **High**: Changes to the payment method schema must be made in two places, increasing the risk of inconsistencies.

### Performance

- **Low**: Schema duplication doesn't significantly impact performance.

### Testability

- **Medium**: Testing must be duplicated for both schema implementations.

## Refactoring Risk Assessment

### Risk Level

- **Medium**: The payment method schema is used in critical financial operations.

### Potential Issues

- Ensuring backward compatibility with existing data
- Maintaining proper references between models
- Updating all queries that use either schema

## Refactoring Strategy

### Recommended Approach

1. Extract the common schema definition to a shared file
2. Update both models to use the shared schema
3. Add model-specific fields and indexes as needed
4. Update tests to reflect the new structure

### Estimated Effort

- **Medium**: 1-2 days of development time, including testing

### Priority

- **High**: This refactoring would improve consistency in a critical part of the application
