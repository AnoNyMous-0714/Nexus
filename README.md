# Nexus - Premium Dating App

A modern, full-stack dating application built with React, Node.js, and MongoDB. Features real-time messaging, intelligent matching, and a premium user experience.

## Features

### Core Features
- **User Authentication**: Secure registration and login with JWT tokens and forgot password recovery
- **Profile Management**: Create and edit user profiles with photos and bio
- **Discovery & Swiping**: Browse profiles with intuitive drag-to-swipe interface for desktop and touch for mobile
- **Matching System**: Mutual matching when both users like each other
- **Real-time Messaging**: Chat with matched users with notification support
- **Match Management**: View all matches and unmatch if needed
- **Super Like System**: Limited premium super likes to prioritize matches

### Bonus Features
- **Age & Distance Filters**: Customize discovery preferences with real-time filtering
- **Push Notifications**: Browser notifications for new matches and messages
- **Dark Mode**: Light/dark theme toggle with seamless switching
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Profile Completion Widget**: Visual progress indicator to encourage profile completion
- **Profile Modal**: Click any profile to view detailed information with action buttons
- **Forgot Password**: Secure 3-step password recovery process
- **Toast Notifications**: In-app notifications with auto-dismiss

## Tech Stack

### Frontend
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui with solid backgrounds and animations
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom hooks
- **Theme**: next-themes for dark mode
- **Notifications**: Browser Push API with permission handling

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt password hashing
- **Password Recovery**: Token-based reset with email verification simulation
- **Middleware**: CORS, body-parser, authentication protection

### Database Schema
- **Users**: Profile data, preferences, likes/dislikes, reset tokens
- **Matches**: Mutual match records with timestamps
- **Messages**: Chat messages between matched users with read status

## Key Improvements

### Bug Fixes (Latest)
- **Fixed transparent modal overlay** - Dialog now has solid black/70 background with blur effect
- **Fixed dropdown transparency** - Select dropdowns now have solid card backgrounds
- **Fixed swipe mechanics** - Improved drag event detection with better state management and race condition prevention
- **Implemented forgot password** - Full 3-step recovery with token-based backend endpoints
- **Added super like button** - Gradient-styled button with flame icon and limited daily usage

### UI/UX Enhancements
- **Premium color palette**: Gold primary (#d4a574), dark gray secondary (#2d2d2d), with warm accents
- **Smooth animations**: All transitions use easing functions for polished feel
- **Better spacing and typography**: Improved visual hierarchy with Geist font family
- **Profile modal**: Click any profile to view details, not just in discovery
- **Loading states**: Animated spinners and skeleton screens for better UX
- **Error handling**: User-friendly error messages with color-coded feedback

## Project Structure

\`\`\`
dating-app/
├── frontend/                    # Next.js React app
│   ├── app/
│   │   ├── layout.tsx          # Root layout with theme provider
│   │   ├── globals.css         # Enhanced styles with solid colors
│   │   ├── page.tsx            # Landing page
│   │   ├── register/           # Registration page
│   │   ├── login/              # Login page
│   │   ├── forgot-password/    # Password recovery page
│   │   ├── discover/           # Discovery/swiping page with drag support
│   │   ├── profile/            # User profile page
│   │   ├── matches/            # Matches list page
│   │   └── chat/[matchId]/     # Chat page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components (solid backgrounds)
│   │   ├── profile-modal.tsx   # Profile detail modal with super like
│   │   ├── super-like-button.tsx
│   │   ├── profile-completion.tsx
│   │   └── theme-provider.tsx
│   ├── context/
│   │   └── auth-context.tsx
│   ├── hooks/
│   │   ├── use-notifications.ts # Push notification hook
│   │   └── use-mobile.ts
│   └── lib/
│       └── utils.ts
│
├── backend/                     # Node.js Express API
│   ├── middleware/
│   │   └── auth.js             # JWT authentication
│   ├── models/
│   │   ├── User.js             # Includes reset token fields
│   │   ├── Match.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js             # Now includes forgot-password endpoints
│   │   ├── users.js
│   │   ├── matches.js          # Includes super like endpoint
│   │   ├── messages.js
│   │   └── profiles.js
│   └── server.js
│
└── docs/
    ├── README.md               # This file
    ├── DEPLOYMENT.md
    ├── BACKEND_API_DOCS.md     # Updated with new endpoints
    ├── TECHNICAL_LIMITATIONS.md
    └── INNOVATIVE_FEATURES.md
\`\`\`

## Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

\`\`\`bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dating-app
JWT_SECRET=your-super-secret-key-change-this-in-production
CLIENT_URL=http://localhost:3000
NODE_ENV=development
EOF

# 4. Start MongoDB (if local)
mongod

# 5. Run backend
npm run dev
\`\`\`

### Frontend Setup

\`\`\`bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000
EOF

# 4. Run frontend
npm run dev
\`\`\`

**Access the app**: http://localhost:3000

## API Endpoints (Updated)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-reset-code` - Verify reset code
- `POST /api/auth/reset-password` - Set new password

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `GET /api/users/discover` - Get profiles to discover
- `GET /api/users/:id` - Get specific user profile

### Matches
- `POST /api/matches/like/:targetId` - Like a user
- `POST /api/matches/superlike/:targetId` - Send super like
- `POST /api/matches/dislike/:targetId` - Skip a user
- `GET /api/matches` - Get all matches
- `DELETE /api/matches/:matchId` - Unmatch a user

### Messages
- `POST /api/messages` - Send a message
- `GET /api/messages/:matchId` - Get match chat history

## Usage

### Create Account
1. Click "Create Account"
2. Fill in details (email, name, age, bio)
3. Upload profile photo
4. Verify email and set password

### Discover & Swipe
1. Go to Discovery page
2. Adjust age/distance filters
3. Drag profiles left (skip) or right (like) on desktop, or swipe on mobile
4. Click profile to view more details
5. Use Super Like for special matches (1 per session)
6. When both like - it's a match!

### Messaging
1. Go to Matches page
2. Click on a match to open chat
3. Type and send messages
4. Get notifications for new messages

### Manage Profile
1. Click Profile in navigation
2. Edit information or upload new photo
3. View profile completion progress
4. Changes save immediately

## Design System

### Color Palette
- **Primary**: Gold (#d4a574) - Premium, inviting
- **Secondary**: Dark Gray (#2d2d2d) - Professional
- **Accent**: Light Beige (#e8d5c4) - Soft, approachable
- **Background**: Off-white (#fafaf9) - Clean, modern
- **Dark Mode**: Inverted palette with dark backgrounds

### Typography
- **Headings**: Geist (sans-serif, bold)
- **Body**: Geist (sans-serif, regular)
- **Code**: Geist Mono (monospace)

### Components
- All UI components now have solid backgrounds (no transparency)
- Smooth transitions and animations
- Consistent button styling with hover states
- Clear focus states for accessibility

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **CORS Protection**: Restricted cross-origin requests
- **Solid Backgrounds**: Secure modal/dropdown overlays prevent accidental clicks
- **Input Validation**: Server-side validation on all endpoints
- **Protected Routes**: Client-side route protection
- **Token Refresh**: Automatic token management
- **Password Reset**: Secure token-based recovery

## Error Handling

- User-friendly error messages
- Color-coded success/error states
- Network error recovery
- Validation feedback on forms
- Comprehensive server-side validation
- Graceful degradation for missing features

## Performance Optimizations

- Lazy loading of profile images
- Efficient state management with Context API
- Optimized database queries with indexing
- Image compression and resizing
- Caching of static assets
- Minimized bundle size with Next.js optimization

## Deployment

### Frontend to Vercel
\`\`\`bash
git push origin main
# Import in Vercel dashboard
# Add NEXT_PUBLIC_API_URL env var
\`\`\`

### Backend to Heroku
\`\`\`bash
heroku create your-app-name
heroku config:set MONGODB_URI=<your-uri>
heroku config:set JWT_SECRET=<your-secret>
git push heroku main
\`\`\`

## Testing the App

**Quick Test Flow:**
1. Open http://localhost:3000
2. Register with email: test1@test.com, password: Test123!
3. Upload profile photo
4. Register another account: test2@test.com
5. Swipe right to like profiles
6. When both match, chat becomes available
7. Test forgot password flow from login page

## Troubleshooting

### Swipe not working
- Ensure you're dragging at least 60px
- Check browser console for errors
- Try refresh if state is stuck

### Modals appearing transparent
- Should now be fixed with solid backgrounds
- Clear browser cache if needed

### Forgot password not working
- Backend must have password reset endpoints
- Check .env has correct settings
- Ensure JWT_SECRET is configured

### Notifications not showing
- Grant browser notification permission
- Check if browser tab is in focus
- Verify notification hook is initialized

## Future Enhancements

- Video profiles
- Advanced ML-based matching algorithm
- Payment integration for premium features
- Social media integration
- Advanced location services
- E2E message encryption
- Admin dashboard
- Mobile app (React Native)

## Contributing

Contributions welcome! Please:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## License

MIT License - Use freely for personal or commercial purposes

---

Built with Next.js, Node.js, and MongoDB by Nexus Team
