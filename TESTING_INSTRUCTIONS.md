# Testing the EESA Frontend Admin Panel

## Steps to Test:

### 1. Start Your Backend Server
Make sure your Django backend is running on `http://localhost:8000`

### 2. Test API Connectivity
Go to: `http://localhost:3000/eesa/test`

This page will test all the API endpoints and show you which ones are working. Look for:
- ✅ Green status = Working
- ❌ Red status = Not working

### 3. Access Admin Panel
Go to: `http://localhost:3000/eesa/login`

Or directly to dashboard: `http://localhost:3000/eesa`

### 4. Test Each Admin Section

#### Events Panel (`/eesa/events`)
- Should load existing events
- Try creating a new event
- Check if the event appears in the list

#### Academics Panel (`/eesa/academics`)
- Check "Overview" tab for stats
- Try "Schemes" tab to create academic schemes
- Try "Upload" tab to upload resources

#### People Panel (`/eesa/people`)
- Should load existing team members
- Try adding a new team member

## Expected Issues and Solutions:

### If API endpoints show errors:

1. **CORS Issues**: Add your frontend domain to Django CORS settings
2. **CSRF Issues**: Make sure Django CSRF settings allow your frontend domain
3. **Authentication Issues**: Check if your Django session authentication is set up correctly

### If data is not showing:

1. Check Django admin at `http://localhost:8000/admin` to see if data exists
2. Verify your database has test data
3. Check browser network tab for failed requests

### Common Backend Fixes Needed:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
]

CORS_ALLOW_CREDENTIALS = True
```

## Debugging:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try admin operations
4. Check for failed requests (red status)
5. Look at response details for error messages

The frontend now correctly:
- ✅ Uses session-based authentication
- ✅ Includes CSRF tokens in all mutations
- ✅ Has proper error handling
- ✅ Fetches data from correct endpoints
- ✅ Shows loading states
- ✅ Refreshes data after operations
