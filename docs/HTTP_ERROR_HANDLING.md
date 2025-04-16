# HTTP Error Handling

This document describes the HTTP error handling approach used in the Date Night App.

## Overview

The application uses a centralized HTTP error handling approach through Angular's HTTP interceptor mechanism. This provides consistent error handling, logging, and user feedback across the entire application.

## Key Components

### HttpErrorInterceptor

The `HttpErrorInterceptor` is the core component responsible for handling HTTP errors. It provides the following features:

- **Configurable retry logic** with exponential backoff
- **User-friendly error notifications**
- **Detailed error logging**
- **Authentication error handling** with automatic redirection
- **Sanitization of sensitive information** in error logs
- **Standardized error response format**

### Configuration Options

The interceptor can be configured with the following options:

```typescript
export interface HttpErrorInterceptorConfig {
  /** Whether to show notifications for errors */
  showNotifications: boolean;
  /** Whether to retry failed requests */
  retryFailedRequests: boolean;
  /** Maximum number of retry attempts */
  maxRetryAttempts: number;
  /** Base delay for exponential backoff (in ms) */
  retryDelay: number;
  /** Whether to redirect to login on 401 errors */
  redirectToLogin: boolean;
  /** Whether to log errors to console */
  logErrors: boolean;
  /** Whether to include request details in error logs */
  includeRequestDetails: boolean;
}
```

## Error Handling Process

1. **Request Interception**: The interceptor captures all outgoing HTTP requests
2. **Retry Logic**: For retryable errors, the request is retried with exponential backoff
3. **Error Processing**: When an error occurs, it is processed to extract relevant information
4. **User Notification**: User-friendly error messages are displayed via the NotificationService
5. **Authentication Handling**: For 401 errors, the user is redirected to the login page
6. **Error Logging**: Detailed error information is logged to the console
7. **Error Propagation**: The error is returned to the calling code for further handling

## Error Categories

The interceptor categorizes errors into the following types:

| Error Code          | HTTP Status | User Message                                         | Description                                  |
| ------------------- | ----------- | ---------------------------------------------------- | -------------------------------------------- |
| client_error        | N/A         | A problem occurred in your browser                   | Client-side errors (network issues, etc.)    |
| network_error       | 0           | Unable to connect to the server                      | Network connectivity issues or CORS problems |
| bad_request         | 400         | The request was invalid                              | Invalid request parameters or payload        |
| unauthorized        | 401         | Please log in to continue                            | Authentication required                      |
| forbidden           | 403         | You do not have permission to access this resource   | Authorization failure                        |
| not_found           | 404         | The requested resource was not found                 | Resource not found                           |
| timeout             | 408         | The request timed out                                | Request timeout                              |
| conflict            | 409         | The request could not be completed due to a conflict | Resource conflict                            |
| validation_error    | 422         | The submitted data is invalid                        | Validation failure                           |
| too_many_requests   | 429         | Too many requests, please try again later            | Rate limit exceeded                          |
| server_error        | 500         | Something went wrong on our end                      | Internal server error                        |
| service_unavailable | 503         | Service temporarily unavailable                      | Service unavailable                          |

## Usage in Components and Services

When making HTTP requests in components or services, errors can be handled as follows:

```typescript
this.http.get<User[]>('/api/users').subscribe({
  next: users => {
    // Handle successful response
    this.users = users;
  },
  error: error => {
    // The interceptor has already shown a notification to the user
    // and logged the error, but you can add component-specific handling here
    this.loading = false;
    this.errorState = true;

    // Access the standardized error information
    console.log('Error code:', error.details.errorCode);
    console.log('User message:', error.message);
    console.log('Technical details:', error.details.technicalMessage);
  },
});
```

## Best Practices

1. **Don't duplicate error notifications**: The interceptor already shows notifications, so avoid showing additional ones in components unless necessary
2. **Use the standardized error format**: Access error details through the `error.details` object
3. **Handle specific error codes**: When needed, add specific handling for certain error codes
4. **Add retry logic selectively**: Configure retry logic based on the nature of the request
5. **Sanitize sensitive data**: Ensure sensitive information is not included in error logs

## Testing

The interceptor includes comprehensive unit tests that verify:

- Handling of different HTTP status codes
- Retry logic with exponential backoff
- User notification functionality
- Authentication error redirection
- Sanitization of sensitive information
- Error propagation to calling code

## Future Improvements

- Add support for offline mode with request queueing
- Implement circuit breaker pattern for failing endpoints
- Add telemetry for error tracking and analysis
- Support for custom error handlers per endpoint
- Integration with application-wide error boundary
