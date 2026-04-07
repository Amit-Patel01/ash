# Concerns

## Security
- **Credentials Storage**: `credentials.json` directly in `backend/`. Ensure it is added to `.gitignore`.
- **Environment Variables**: Some hardcoding of URLs/Keys observed? (Need to verify).

## Performance/Scaling
- **Local Media Storage**: Multer stores on local disk. This will not scale horizontally (requires S3/Azure Blob/Firebase Storage).
- **No Global Stat**: Redux/Context not used for global states? (Could lead to prop-drilling).

## Code Hygiene
- **Large Server File**: `server.js` is over 1000 lines. Refactoring into controllers/routes is recommended.
- **Error Handling**: Basic Express error handlers. Needs robust validation.
