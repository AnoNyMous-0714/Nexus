# Dating App - Comprehensive Codebase Overview

## Project Architecture

This is a full-stack dating app built with:
- **Frontend**: Next.js 16 (React 19) with TypeScript
- **Backend**: Express.js with Node.js
- **Database**: MongoDB
- **Styling**: Tailwind CSS v4

---

## Backend Structure

### Core Files

#### `server.js`
The main Express server entry point that:
- Initializes Express and middleware (CORS, JSON parsing with 50MB limit for images)
- Connects to MongoDB database
- Registers all API routes (auth, users, matches, messages, profiles)
- Provides health check endpoint (`/api/health`)
- Includes global error handling middleware
- Runs on PORT (default 5000)

**Key Features**: CORS protection, error handling, database connection pooling

---

### Database Models

#### `models/User.js`
Stores complete user profile information:
- **Auth Fields**: email (unique), password (hashed with bcrypt)
- **Profile Fields**: name, age (18-120), bio, profilePicture (Base64)
- **Preference Fields**: gender, interestedIn, preferences (ageMin, ageMax, maxDistance)
- **Location**: latitude, longitude, city
- **Relationship Arrays**: likes[], dislikes[], matches[], blockedUsers[]
- **Metadata**: isVerified, lastActive, timestamps

**Key Methods**:
- `comparePassword()` - Securely compare passwords using bcrypt
- `getPublicProfile()` - Returns profile without sensitive data (password, blockedUsers)

**Indexes**: email (unique), for fast lookups

---

#### `models/Match.js`
Tracks mutual likes between users:
- **Fields**: user1, user2 (ObjectId references), status (active/unmatched)
- **Timestamps**: matchedAt, unmatchedAt, lastMessageAt
- **Index**: Unique constraint on user1+user2 pair to prevent duplicates

**Purpose**: Central record of all matches, used to enable messaging

---

#### `models/Message.js`
Stores chat messages between matched users:
- **Fields**: match (Match reference), sender, recipient, content (max 1000 chars)
- **Status**: isRead, readAt timestamp
- **Indexes**: match+createdAt (for sorting), recipient+isRead (for unread count)

**Purpose**: Persistent message storage with read status tracking

---

### Middleware

#### `middleware/auth.js`
JWT authentication middleware:
- Extracts token from Authorization header (`Bearer <token>`)
- Verifies token signature using JWT_SECRET
- Attaches `req.userId` for protected routes
- Returns 401 Unauthorized if token is missing or invalid

**Used by**: All authenticated endpoints

---

### API Routes

#### `routes/auth.js`
Handles authentication (4 endpoints):

1. **POST `/api/auth/register`**
   - Validates required fields (email, password, name, age, gender, interestedIn)
   - Checks for duplicate email
   - Creates new user with hashed password
   - Returns JWT token and user profile
   - Status: 201 Created

2. **POST `/api/auth/login`**
   - Validates email and password
   - Compares password with bcrypt
   - Updates lastActive timestamp
   - Returns JWT token and user profile
   - Status: 200 OK

3. **POST `/api/auth/forgot-password`**
   - Generates crypto random reset token (valid 1 hour)
   - Stores hashed token in user document
   - Returns reset link (in development, removed in production)
   - Privacy-safe: doesn't reveal if email exists

4. **POST `/api/auth/reset-password`**
   - Validates reset token hasn't expired
   - Updates password (bcrypt hashed)
   - Clears reset token fields
   - Status: 200 OK

---

#### `routes/users.js`
Handles user profile operations (4 endpoints):

1. **GET `/api/users/me`** (Protected)
   - Returns current user profile
   - Excludes password field

2. **PUT `/api/users/me`** (Protected)
   - Updates allowed fields: name, bio, age, profilePicture, preferences, location
   - Updates `updatedAt` timestamp
   - Returns updated user object

3. **GET `/api/users/discover`** (Protected)
   - Returns 20 profiles to discover
   - **Filters out**:
     - Current user
     - Already liked profiles
     - Already disliked profiles
     - Matched users
     - Blocked users
   - **Applies age filter** based on user preferences
   - **Respects gender preference** (male, female, both)
   - Used by: Discover page

4. **GET `/api/users/:id`** (Protected)
   - Returns specific user profile
   - Excludes password and blockedUsers

---

#### `routes/matches.js`
Handles liking and matching (5 endpoints):

1. **POST `/api/matches/like/:targetId`** (Protected)
   - Adds profile to current user's likes array
   - **Creates match** if target user already likes current user
   - Adds both users to matches arrays
   - Returns `{ matched: true/false }`

2. **POST `/api/matches/super-like/:targetId`** (Protected)
   - Same as like, but marks as super like
   - Stores in superLikes array for special handling
   - Returns `{ matched: true/false, isSuperLike: true }`

3. **POST `/api/matches/dislike/:targetId`** (Protected)
   - Adds profile to current user's dislikes array
   - Used when swiping left

4. **GET `/api/matches`** (Protected)
   - Returns all active matches for current user
   - **Joins** user1 and user2 profiles with populate()
   - Sorts by matchedAt (newest first)
   - Used by: Matches page

5. **DELETE `/api/matches/:matchId`** (Protected)
   - Verifies user is part of this match
   - Sets status to "unmatched"
   - Removes from both users' matches arrays
   - Disables messaging for this match

---

#### `routes/messages.js`
Handles real-time chat (3 endpoints):

1. **POST `/api/messages`** (Protected)
   - Validates match exists and user is authorized
   - Creates message with sender, recipient, content
   - Updates match's lastMessageAt
   - Returns: Message object with metadata
   - **Limitation**: Polling-based, not WebSocket (2-second latency)

2. **GET `/api/messages/:matchId`** (Protected)
   - Retrieves all messages for a match
   - Automatically marks recipient's messages as read
   - Sorts chronologically (oldest first)
   - Used by: Chat page

3. **GET `/api/messages/unread/count`** (Protected)
   - Returns count of unread messages for current user
   - Used for: Badge notifications

---

#### `routes/profiles.js`
Handles profile management (2 endpoints):

1. **GET `/api/profiles/:userId`** (Protected)
   - Returns public profile view (excludes: password, blockedUsers, likes, dislikes)
   - Used by: Profile modal

2. **POST `/api/profiles/block/:userId`** (Protected)
   - Adds user to blockedUsers array
   - Prevents blocked user from appearing in discovery

---

## Frontend Structure

### Configuration Files

#### `app/layout.tsx`
Root layout that:
- Sets up HTML document with Geist font family
- Wraps app with ThemeProvider (dark mode support)
- Wraps app with AuthProvider (authentication context)
- Applies global styles

#### `next.config.mjs`
Next.js configuration for:
- Build optimization
- Image optimization

#### `tsconfig.json`
TypeScript configuration with path alias `@/*` for imports

---

### Global Styles

#### `app/globals.css`
Tailwind CSS v4 configuration with:
- **Design Tokens** (CSS variables for theming):
  - Colors: background, foreground, primary, secondary, accent, destructive, muted
  - Radius: Default 0.5rem (8px)
- **Dark mode support** via `dark:` prefix
- **Base styles** for body, headings, forms
- **Custom utilities** for animations and spacing

---

### Context & State Management

#### `context/auth-context.tsx`
Global authentication state manager:
- **State**: user (null | User), token (JWT), loading, error
- **Initialization**: Restores token from localStorage on mount
- **Methods**:
  - `register(data)` - Create new account
  - `login(email, password)` - Authenticate user
  - `logout()` - Clear auth state
  - `updateProfile(data)` - Update user info
- **Persistence**: Stores token in localStorage
- **Error Handling**: Catches and surfaces errors to UI

**Used by**: Every authenticated page/component

---

### Custom Hooks

#### `hooks/use-notifications.ts`
Manages browser push notifications:
- **State**: notifications[], permissionStatus
- **Methods**:
  - `requestPermission()` - Ask user for notification access
  - `sendNotification(title, message, type)` - Display notification
  - `removeNotification(id)` - Clear from UI
- **Features**: Auto-removes after 4 seconds, browser API integration
- **Used by**: Discover, Matches, Chat pages

#### `hooks/use-toast.ts`
Toast notification system (provided by shadcn/ui)

#### `hooks/use-mobile.ts`
Responsive design hook to detect mobile screens

---

### Pages (App Router)

#### `app/page.tsx` (Landing Page)
Entry point for unauthenticated users:
- Shows app features and benefits
- CTA to Register/Login
- Responsive design

#### `app/register/page.tsx`
User registration form:
- Fields: email, password, name, age, gender, interestedIn, bio, profilePicture (upload)
- Validation before submission
- Image upload as Base64
- Redirects to discover on success

#### `app/login/page.tsx`
User login form:
- Fields: email, password
- "Forgot Password?" link
- Remember me option
- Redirects to discover on success

#### `app/forgot-password/page.tsx`
Password recovery flow:
- **Step 1**: Enter email
- **Step 2**: Enter verification code (from email)
- **Step 3**: Set new password
- Token-based validation

#### `app/discover/page.tsx`
Main discovery interface:
- **Displays**: One profile card at a time
- **Swipe Mechanics**: Drag right (like), drag left (dislike)
- **Filters**: Age range, distance slider
- **Actions**: Like, Super Like, Dislike buttons
- **Profile Modal**: Click to view full details
- **Features**: 
  - Prevents duplicate profiles
  - Smooth animations
  - Notification on match
  - Supports both mouse and touch

#### `app/profile/page.tsx`
User's own profile:
- **View**: Current profile details
- **Edit**: Update name, bio, age, photo
- **Progress**: Profile completion percentage
- **Settings**: Dark mode toggle

#### `app/matches/page.tsx`
List of all matches:
- **Displays**: Grid of matched profiles
- **Actions**: Message, View Profile, Unmatch
- **Empty State**: If no matches
- **Profile Modal**: Click profile for details
- **Real-time**: Shows last message timestamp

#### `app/chat/[matchId]/page.tsx`
Real-time chat interface:
- **Messages**: Chronological list with sender/recipient
- **Input**: Text input to send messages
- **Status**: Read indicators, typing status (future)
- **Notifications**: Toast on new messages
- **Features**: Auto-scroll to latest, emoji support

---

### Components

#### `components/ui/*`
shadcn/ui components (60+ pre-built):
- **Layout**: Card, Container, Separator, Drawer
- **Forms**: Input, Label, Button, Select, Textarea, Checkbox, RadioGroup
- **Dialogs**: Dialog, AlertDialog, Sheet, Popover
- **Lists**: Table, Breadcrumb, Tabs
- **Indicators**: Badge, Progress, Skeleton, Spinner, Toast
- **Menus**: DropdownMenu, NavigationMenu, Menubar
- **Utilities**: Avatar, Tooltip, Pagination, ScrollArea

#### `components/theme-provider.tsx`
Next-themes integration for dark mode:
- Auto-detects system preference
- Persistent theme selection
- Smooth transitions

#### `components/profile-modal.tsx`
Detailed profile view component:
- **Trigger**: Click profile card
- **Content**: Full user details
- **Actions**: Like, Super Like, Pass, Block, Report
- **Gallery**: Profile photos
- **User Info**: Bio, age, distance, interests

#### `components/profile-completion.tsx`
Profile progress widget:
- Shows completion percentage
- Checklist of missing fields
- Direct links to edit sections

#### `components/super-like-button.tsx`
Special like action with:
- Flame icon animation
- Limit: 1 per session
- Visual feedback
- Tooltip explanation

---

## Key Features & Their Implementation

### Authentication Flow
1. User registers/logs in → `auth-context.tsx` stores JWT
2. Token sent in `Authorization: Bearer <token>` header
3. Backend validates with `middleware/auth.js`
4. On logout, token cleared from localStorage

### Discovery & Matching
1. Load profiles: `GET /api/users/discover`
2. Filter excludes: current user, already liked/disliked, matches, blocked users
3. Like action: `POST /api/matches/like/:targetId`
4. Mutual like → Creates Match → Enables messaging

### Messaging
1. Match created → Chat accessible
2. Send: `POST /api/messages` with match ID and content
3. Retrieve: `GET /api/messages/:matchId` (auto-marks read)
4. Polling updates every 2 seconds (limitation: needs WebSocket upgrade)

### Notifications
1. `useNotifications()` hook requests browser permission
2. Match/message triggers `sendNotification()`
3. Auto-removes toast after 4 seconds
4. Browser API handles native OS notifications

---

## Database Relationships

\`\`\`
User ──┐
       ├─→ matches ──→ User
       ├─→ likes ──→ User
       ├─→ dislikes ──→ User
       └─→ blockedUsers ──→ User

Match ──→ user1 (User)
      ──→ user2 (User)
      ──→ messages (Message[])

Message ──→ match (Match)
        ──→ sender (User)
        ──→ recipient (User)
\`\`\`

---

## API Response Format

### Success Response
\`\`\`json
{
  "token": "eyJhbGc...",
  "user": { "_id": "...", "email": "...", ... }
}
\`\`\`

### Error Response
\`\`\`json
{
  "error": "Description of what went wrong",
  "status": 400
}
\`\`\`

### Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request (validation failed)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (not authorized for action)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

---

## Environment Variables

### Backend (.env)
\`\`\`
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dating-app
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:3000
NODE_ENV=development
\`\`\`

### Frontend (.env.local)
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:5000
\`\`\`

---

## Security Features

1. **Password Hashing**: bcrypt with salt (10 rounds)
2. **JWT Authentication**: 30-day expiration, signed with secret
3. **Password Reset**: 1-hour token expiration, crypto-random tokens
4. **CORS**: Restricted to CLIENT_URL origin
5. **Input Validation**: Required fields checked server-side
6. **Private Data Filtering**: Passwords/blockedUsers excluded from responses
7. **Authorization Checks**: User verified before profile/message operations

---

## Performance Optimizations

1. **Database Indexes**: 
   - User email (unique)
   - Message match+createdAt (sorted queries)
   - Message recipient+isRead (unread count)

2. **Lean Queries**: Using `.lean()` for read-only operations
3. **Pagination**: Discover limits to 20 profiles
4. **Selective Projection**: Exclude unnecessary fields (`-password`)
5. **Caching**: Token stored in localStorage, reduces auth API calls

---

## Known Limitations & Future Improvements

| Limitation | Impact | Solution |
|-----------|--------|----------|
| Polling (2s latency) | Delayed messages | Implement WebSocket/Socket.io |
| Base64 images | Large database | Use cloud storage (S3, Cloudinary) |
| No real location | Inaccurate distance | Integrate Google Maps API |
| Single server | Doesn't scale | Add load balancer, multiple instances |
| No E2E encryption | Message privacy | Implement TweetNaCl.js encryption |
| Basic error UI | Poor UX | Add detailed error modals |

---

## Testing Checklist

- [ ] Register new account with valid data
- [ ] Attempt register with duplicate email
- [ ] Login with correct credentials
- [ ] Login with wrong password
- [ ] Forgot password flow (3 steps)
- [ ] Discover: Like profile
- [ ] Discover: Dislike profile
- [ ] Discover: Super like
- [ ] Swipe mechanics (mouse + touch)
- [ ] Match created after mutual like
- [ ] Chat: Send/receive messages
- [ ] Chat: Mark as read
- [ ] Unmatch removes chat access
- [ ] Block user hides in discover
- [ ] Filters (age, distance) work correctly
- [ ] Profile completion widget updates
- [ ] Dark mode toggle works
- [ ] Notifications show correctly

---
