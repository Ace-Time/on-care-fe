# Backend Debugging Guide for Todo Creation 500 Error

## Problem
When creating a new todo item, the backend returns a 500 error with message: "서버 내부 오류입니다. 관리자에게 문의하세요."

## Frontend Request Details
- **Endpoint**: `POST http://localhost:5000/api/todos`
- **Payload Structure**:
```json
{
  "todo": "할 일 내용",
  "todoDate": "2025-12-22",
  "type": null  // or string value like "업무일지"
}
```

## Common Causes of 500 Errors

### 1. Database Schema Mismatch
Check if the backend database table has different column names or required fields:
- Frontend sends: `todo`, `todoDate`, `type`
- Backend might expect: `content`, `dueDate`, `category`, etc.

### 2. Missing Required Fields
The backend may require additional fields that frontend isn't sending:
- `userId` / `employeeId` (from authentication)
- `status` / `isCompleted` (default values)
- `createdAt` / `updatedAt` (auto-generated)
- `priority` / `description` (optional fields with constraints)

### 3. Authentication/Authorization Issues
- Check if the backend is properly extracting user ID from JWT token
- Verify the token is being sent in Authorization header
- Check if user role permissions allow todo creation

### 4. Database Constraints
- NOT NULL constraints on fields
- Foreign key constraints (e.g., userId must exist)
- UNIQUE constraints
- Data type mismatches (e.g., date format)

### 5. Validation Errors
- String length limits
- Date format validation
- Enum/type validation

## How to Debug

### Step 1: Check Backend Logs
Look for error stack traces in your backend server console when the POST request is made.

### Step 2: Check Database Schema
```sql
-- Example query to check table structure
DESCRIBE todos;
-- or
SHOW CREATE TABLE todos;
```

### Step 3: Check Backend API Controller
Look for the POST `/api/todos` endpoint implementation and check:
1. Request body parsing
2. Validation logic
3. Database insert query
4. Error handling

### Step 4: Test Payload Variations
Try these variations to isolate the issue:

**Minimal payload:**
```json
{
  "todo": "테스트"
}
```

**With all possible fields:**
```json
{
  "todo": "테스트",
  "todoDate": "2025-12-22",
  "type": "업무일지",
  "isCompleted": false,
  "priority": "medium"
}
```

### Step 5: Check Backend Environment
- Database connection is active
- Required migrations are run
- Environment variables are set correctly

## Expected Backend Response on Success
```json
{
  "todoId": 123,
  "todo": "할 일 내용",
  "todoDate": "2025-12-22",
  "type": "업무일지",
  "isCompleted": false,
  "createdAt": "2025-12-22T10:43:18.000Z"
}
```

## Frontend Changes Made

### 1. Better Error Handling
- Modal stays open on error so user can retry
- Shows detailed error message from backend
- Suggests checking backend logs

### 2. Form Reset on Success Only
- Form only resets after successful submission
- Modal only closes after successful submission
- Console log confirms success

### 3. Enhanced Logging
- Logs the exact payload being sent
- Logs detailed error information
- Logs success message

## Next Steps

1. **Check backend logs** when clicking "추가" button
2. **Verify database schema** matches expected fields
3. **Test with Postman/Insomnia** to isolate frontend/backend issue:
   ```bash
   POST http://localhost:5000/api/todos
   Headers:
     Authorization: Bearer <your-token>
     Content-Type: application/json
   Body:
     {
       "todo": "테스트",
       "todoDate": "2025-12-22",
       "type": null
     }
   ```
4. **Add backend error logging** if not already present
5. **Check if other endpoints work** (getTodos, completeTodo, etc.)

## Quick Backend Fix Template

If the issue is a field name mismatch, you can either:

**Option A: Update Backend** (recommended)
```javascript
// Backend controller
const createTodo = async (req, res) => {
  try {
    const { todo, todoDate, type } = req.body;
    const userId = req.user.id; // from auth middleware

    // Validate required fields
    if (!todo || !todoDate) {
      return res.status(400).json({ message: '필수 항목이 누락되었습니다.' });
    }

    const newTodo = await TodoModel.create({
      todo,
      todoDate,
      type,
      userId,
      isCompleted: false
    });

    return res.status(201).json(newTodo);
  } catch (error) {
    console.error('Todo creation error:', error);
    return res.status(500).json({ message: error.message });
  }
};
```

**Option B: Update Frontend**
If backend expects different field names, update the frontend payload in TodoList.vue.
