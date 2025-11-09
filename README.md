# EcoLink Social - Next.js Client

A modern, Facebook/LinkedIn-style social network built with Next.js, TypeScript, and GraphQL.

## 🚀 Features

- ✅ **Authentication** - Login with JWT tokens
- ✅ **Feed** - Infinite scroll feed with latest posts
- ✅ **Posts** - Create, like, comment on posts
- ✅ **Profiles** - User profiles with posts and followers
- ✅ **Real-time** - Live updates with Apollo Client
- ✅ **Dark Mode** - Beautiful dark mode support
- ✅ **Responsive** - Mobile-first design
- ✅ **TypeScript** - Full type safety

## 📋 Prerequisites

- Node.js 18+ installed
- Backend GraphQL API running on http://localhost:4000

## 🛠️ Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Create environment file:**
Create a `.env.local` file in the root of the client folder:
```env
NEXT_PUBLIC_GRAPHQL_URI=http://localhost:4000
NEXT_PUBLIC_APP_NAME=EcoLink Social
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Test Accounts

Use these accounts to login:

- **Admin:** admin@example.org / 1234
- **User:** user@example.org / 1234
- **Moderator:** moderator@example.org / 1234

## 📁 Project Structure

```
client/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (main)/            # Protected pages
│   │   │   ├── page.tsx       # Feed page
│   │   │   ├── post/[id]/     # Individual post
│   │   │   └── profile/[slug]/ # User profiles
│   │   ├── login/             # Login page
│   │   └── register/          # Register page
│   ├── components/
│   │   ├── layout/            # Navbar, Sidebar, etc.
│   │   ├── post/              # Post components
│   │   └── ui/                # Reusable UI components
│   ├── context/               # React context (Auth)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/
│   │   ├── apollo-client.ts   # Apollo Client setup
│   │   ├── auth.ts            # Auth utilities
│   │   └── graphql/           # GraphQL queries/mutations
│   └── types/                 # TypeScript types
```

## 🎨 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **GraphQL:** Apollo Client
- **Forms:** React Hook Form + Zod
- **UI Components:** Headless UI + Heroicons
- **Notifications:** React Hot Toast

## 🌟 Key Features

### Authentication
- JWT-based authentication
- Protected routes with redirects
- Token stored in localStorage
- Automatic token refresh

### Feed
- Infinite scroll pagination
- Real-time updates
- Like/unlike posts
- Comment on posts
- Share posts

### Posts
- Rich text content
- Title and body
- Like counter
- Comment counter
- Author information
- Timestamp

### User Profiles
- Profile header with cover photo
- Avatar with initials fallback
- Followers/following count
- User's posts
- Follow/unfollow button

### UI/UX
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Loading states
- Error handling
- Toast notifications
- Smooth animations

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

## 🔗 GraphQL API

The app connects to a GraphQL backend. Key operations:

### Queries
- `currentUser` - Get logged in user
- `Post` - Get posts
- `User` - Get users

### Mutations
- `login` - Login with email/password
- `CreatePost` - Create a new post
- `CreateComment` - Add a comment
- `shout` / `unshout` - Like/unlike posts
- `followUser` / `unfollowUser` - Follow users

## 🐛 Troubleshooting

### Can't connect to backend
- Make sure the backend is running on port 4000
- Check `NEXT_PUBLIC_GRAPHQL_URI` in `.env.local`

### Authentication issues
- Clear localStorage
- Check if JWT token is valid
- Make sure backend is seeded with test users

### Build errors
- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Try `npm run build`

## 📦 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker
```dockerfile
# Dockerfile is included
docker build -t ecolink-client .
docker run -p 3000:3000 ecolink-client
```

## 🎯 Future Enhancements

- [ ] Real-time notifications
- [ ] Direct messaging
- [ ] Groups/Communities
- [ ] Search functionality
- [ ] Image uploads
- [ ] Video posts
- [ ] Stories
- [ ] Email notifications

## 📄 License

MIT

## 👥 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

---

Built with ❤️ using Next.js and GraphQL
