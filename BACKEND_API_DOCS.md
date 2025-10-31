# Backend API Documentation

## Base URL
\`\`\`
http://localhost:5000/api
\`\`\`

## Authentication
All protected endpoints require Bearer token in Authorization header:
\`\`\`
Authorization: Bearer <JWT_TOKEN>
\`\`\`

---

## Auth Endpoints

### 1. Register User
**POST** `/auth/register`

**Body**:
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "age": 25,
  "gender": "male",
  "interestedIn": "female",
  "bio": "Adventure seeker"
}
\`\`\`

**Response** (201):
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "age": 25,
    "gender": "male",
    "interestedIn": "female",
    "bio": "Adventure seeker"
  }
}
\`\`\`

---

### 2. Login User
**POST** `/auth/login`

**Body**:
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

**Response** (200):
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
\`\`\`

---

### 3. Forgot Password
**POST** `/auth/forgot-password`

**Body**:
\`\`\`json
{
  "email": "user@example.com"
}
\`\`\`

**Response** (200):
\`\`\`json
{
  "message": "Reset code sent to email"
}
\`\`\`

---

### 4. Verify Reset Code
**POST** `/auth/verify-reset-code`

**Body**:
\`\`\`json
{
  "email": "user@example.com",
  "code": "123456"
}
\`\`\`

**Response** (200):
\`\`\`json
{
  "message": "Code verified"
}
\`\`\`

---

### 5. Reset Password
**POST** `/auth/reset-password`

**Body**:
\`\`\`json
{
  "email": "user@example.com",
  "code": "123456",
  "password": "newpassword123"
}
\`\`\`

**Response** (200):
\`\`\`json
{
  "message": "Password reset successfully"
}
\`\`\`

---

## User Endpoints

### 1. Get Current User
**GET** `/users/me` (Protected)

**Response** (200):
\`\`\`json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "age": 25,
  "bio": "Adventure seeker",
  "gender": "male",
  "interestedIn": "female",
  "profilePicture": "data:image/jpeg;base64,...",
  "likes": ["507f1f77bcf86cd799439012"],
  "dislikes": ["507f1f77bcf86cd799439013"],
  "matches": ["507f1f77bcf86cd799439014"]
}
\`\`\`

---

### 2. Update User Profile
**PUT** `/users/me` (Protected)

**Body**:
\`\`\`json
{
  "name": "John Updated",
  "bio": "Updated bio",
  "age": 26,
  "profilePicture": "data:image/jpeg;base64,..."
}
\`\`\`

**Response** (200):
\`\`\`json
{
  "message": "Profile updated",
  "user": { ... }
}
\`\`\`

---

### 3. Discover Profiles
**GET** `/users/discover?ageMin=18&ageMax=50&maxDistance=50` (Protected)

**Query Parameters**:
- `ageMin` (number): Minimum age
- `ageMax` (number): Maximum age
- `maxDistance` (number): Maximum distance in km

**Response** (200):
\`\`\`json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Jane Doe",
    "age": 24,
    "bio": "Love hiking and travel",
    "gender": "female",
    "interestedIn": "male",
    "profilePicture": "...",
    "distance": 12
  },
  ...
]
\`\`\`

---

## Matching Endpoints

### 1. Like a Profile
**POST** `/matches/like/:userId` (Protected)

**Response** (200):
\`\`\`json
{
  "matched": false,
  "message": "Liked user"
}
\`\`\`

Or if mutual like:
\`\`\`json
{
  "matched": true,
  "matchId": "507f1f77bcf86cd799439015",
  "message": "It's a match!"
}
\`\`\`

---

### 2. Super Like a Profile
**POST** `/matches/superlike/:userId` (Protected)

**Response** (200):
\`\`\`json
{
  "matched": false,
  "superLiked": true,
  "message": "Super liked user!"
}
\`\`\`

---

### 3. Dislike/Skip a Profile
**POST** `/matches/dislike/:userId` (Protected)

**Response** (200):
\`\`\`json
{
  "message": "Skipped user"
}
\`\`\`

---

### 4. Get All Matches
**GET** `/matches` (Protected)

**Response** (200):
\`\`\`json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "user1": { ... },
    "user2": { ... },
    "matchedAt": "2025-10-31T10:30:00Z"
  },
  ...
]
\`\`\`

---

### 5. Unmatch User
**DELETE** `/matches/:matchId` (Protected)

**Response** (200):
\`\`\`json
{
  "message": "Unmatched successfully"
}
\`\`\`

---

## Message Endpoints

### 1. Get Chat Messages
**GET** `/messages/:matchId` (Protected)

**Response** (200):
\`\`\`json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "matchId": "507f1f77bcf86cd799439015",
    "sender": "507f1f77bcf86cd799439011",
    "content": "Hey! How are you?",
    "createdAt": "2025-10-31T10:30:00Z",
    "isRead": true
  },
  ...
]
\`\`\`

---

### 2. Send Message
**POST** `/messages` (Protected)

**Body**:
\`\`\`json
{
  "matchId": "507f1f77bcf86cd799439015",
  "content": "Hey! How are you?"
}
\`\`\`

**Response** (201):
\`\`\`json
{
  "_id": "507f1f77bcf86cd799439020",
  "matchId": "507f1f77bcf86cd799439015",
  "sender": "507f1f77bcf86cd799439011",
  "content": "Hey! How are you?",
  "createdAt": "2025-10-31T10:30:00Z",
  "isRead": false
}
\`\`\`

---

## Error Responses

### 400 Bad Request
\`\`\`json
{
  "error": "Invalid email format"
}
\`\`\`

### 401 Unauthorized
\`\`\`json
{
  "error": "Invalid token"
}
\`\`\`

### 404 Not Found
\`\`\`json
{
  "error": "User not found"
}
\`\`\`

### 500 Server Error
\`\`\`json
{
  "error": "Internal server error"
}
\`\`\`

---

## Rate Limiting (Recommended)

- Auth endpoints: 5 requests per minute
- API endpoints: 100 requests per minute
- Message endpoints: 30 requests per minute

---

## Examples

### Complete Registration Flow
\`\`\`bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secure123",
    "name": "John Doe",
    "age": 25,
    "gender": "male",
    "interestedIn": "female",
    "bio": "Adventure seeker"
  }'

# Response: { "token": "...", "user": { ... } }

# 2. Get current user
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer <token>"

# 3. Discover profiles
curl -X GET "http://localhost:5000/api/users/discover?ageMin=20&ageMax=30" \
  -H "Authorization: Bearer <token>"

# 4. Like a user
curl -X POST http://localhost:5000/api/matches/like/userId123 \
  -H "Authorization: Bearer <token>"
\`\`\`

---

This API is RESTful and follows standard HTTP conventions. All responses are JSON.
