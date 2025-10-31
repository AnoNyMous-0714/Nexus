# Technical Implementation Notes

## Architecture Decisions

### Frontend Architecture
- **Next.js App Router**: Modern routing with server/client components
- **React Context**: Lightweight state management for auth
- **Tailwind CSS**: Utility-first CSS for rapid development
- **shadcn/ui**: Pre-built accessible components

### Backend Architecture
- **Express.js**: Lightweight, flexible web framework
- **MongoDB**: Document-based database for flexible schema
- **JWT**: Stateless authentication
- **RESTful API**: Standard HTTP methods for CRUD operations

## Database Design

### User Collection
\`\`\`javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  age: Number,
  bio: String,
  gender: String,
  interestedIn: String,
  profilePicture: String (base64),
  likes: [ObjectId],
  dislikes: [ObjectId],
  matches: [ObjectId],
  blockedUsers: [ObjectId],
  preferences: {
    ageMin: Number,
    ageMax: Number,
    maxDistance: Number
  },
  location: {
    latitude: Number,
    longitude: Number,
    city: String
  },
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Match Collection
\`\`\`javascript
{
  _id: ObjectId,
  user1: ObjectId (ref: User),
  user2: ObjectId (ref: User),
  status: String (active/unmatched),
  matchedAt: Date,
  unmatchedAt: Date,
  lastMessageAt: Date
}
\`\`\`

### Message Collection
\`\`\`javascript
{
  _id: ObjectId,
  match: ObjectId (ref: Match),
  sender: ObjectId (ref: User),
  recipient: ObjectId (ref: User),
  content: String,
  isRead: Boolean,
  readAt: Date,
  createdAt: Date
}
\`\`\`

## API Response Format

All API responses follow a consistent format:

### Success Response
\`\`\`json
{
  "data": {},
  "status": 200
}
\`\`\`

### Error Response
\`\`\`json
{
  "error": "Error message",
  "status": 400
}
\`\`\`

## Authentication Flow

1. User registers with email/password
2. Password is hashed with bcrypt
3. JWT token is generated
4. Token is stored in localStorage
5. Token is sent in Authorization header for protected routes
6. Server verifies token and extracts userId
7. Token expires after 30 days

## Matching Algorithm

1. User A likes User B
2. Check if User B has already liked User A
3. If yes, create Match record
4. Add both users to each other's matches array
5. Trigger notification

## Real-time Messaging

- Messages are fetched every 2 seconds (polling)
- Could be upgraded to WebSockets for true real-time
- Messages are marked as read when viewed
- Message history is persisted in database

## Performance Considerations

- Profile pictures stored as base64 (could use CDN)
- Pagination for profile discovery
- Database indexes on frequently queried fields
- Lazy loading of images
- Caching of user preferences

## Security Considerations

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens expire after 30 days
- CORS enabled only for frontend domain
- Input validation on all endpoints
- SQL injection prevention (using MongoDB)
- XSS prevention with React's built-in escaping

## Error Handling Strategy

- Try-catch blocks on all async operations
- Meaningful error messages for users
- Logging of errors for debugging
- Graceful degradation on failures
- User-friendly error notifications

## Testing Strategy

- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for user flows
- Manual testing of UI/UX

## Future Improvements

- Implement WebSockets for real-time messaging
- Add image optimization and CDN
- Implement caching layer (Redis)
- Add rate limiting
- Implement search functionality
- Add user verification
- Implement recommendation algorithm
- Add analytics tracking
