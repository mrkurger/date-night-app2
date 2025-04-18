# Temporary Messages Feature

## Overview

The temporary messages feature allows users to send messages that automatically expire after a specified time period. This is useful for sensitive information that should not be stored permanently.

## Implementation Details

### User Interface

- A timer icon button in the message input area toggles temporary message mode
- When enabled, the input area changes to a warning color to indicate temporary message mode
- Users can select from predefined expiration times (1 hour, 4 hours, 8 hours, 1 day, 2 days, 3 days, 7 days)
- Temporary messages are visually distinguished with a dashed border and a timer icon
- Hovering over the timer icon shows the remaining time until expiration
- Messages about to expire (within 5 minutes) have a pulsing animation and rotating timer icon
- Notifications are shown when messages are about to expire or have expired

### Technical Implementation

- Messages are marked with an `expiresAt` timestamp in the database
- The client periodically checks for expired messages and removes them from the UI
- The server has a background job that permanently deletes expired messages
- For encrypted messages, the expiration time is included in the encrypted data

### Data Model Changes

- Added `expiresAt` field to the `ChatMessage` interface
- Added `ttl` field to track the time-to-live in hours

### Service Changes

- Updated `ChatService.sendMessage()` to handle TTL parameter
- Updated `EncryptionService.encryptMessage()` to include expiration time
- Added utility method `convertHoursToMilliseconds()` for TTL conversion

## Usage

1. Click the timer icon in the message input area to enable temporary message mode
2. Select the desired expiration time from the dropdown menu
3. Type your message and send it
4. The message will be automatically deleted after the specified time period

## Security Considerations

- Temporary messages are still stored in the database until they expire
- Screenshots or copies of the message content can still be made by recipients
- The feature should not be relied upon for highly sensitive information

## Future Enhancements

- Add custom expiration times
- Add option to delete messages immediately after being read
- Add ability to revoke messages before they expire
- Implement screenshot detection and prevention
