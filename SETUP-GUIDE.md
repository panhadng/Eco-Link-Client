# 🚀 Quick Setup Guide

## Step 1: Create Environment File

Create a file named `.env.local` in the `client` folder with:

```env
NEXT_PUBLIC_GRAPHQL_URI=http://localhost:4000
NEXT_PUBLIC_APP_NAME=EcoLink Social
```

## Step 2: Start the Development Server

```bash
npm run dev
```

## Step 3: Open Your Browser

Navigate to: **http://localhost:3000**

## Step 4: Login

Use any of these test accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@example.org | 1234 |
| **User** | user@example.org | 1234 |
| **Moderator** | moderator@example.org | 1234 |

## ✨ You're Ready!

You should now see:
- ✅ Login page at http://localhost:3000/login
- ✅ Feed page after login
- ✅ Create posts, like, comment
- ✅ View user profiles
- ✅ Responsive design

## 🎯 What Can You Do?

### Feed Page (/)
- Create new posts
- Like/unlike posts
- Comment on posts
- View all posts with infinite scroll

### Profile Page (/profile/[slug])
- View user information
- See user's posts
- Follow/unfollow users
- Edit profile (if it's your own)

### Individual Post (/post/[id])
- View full post
- See all comments
- Add new comments
- Like the post

## 🔥 Key Features

1. **Real-time Updates** - Posts and comments update automatically
2. **Infinite Scroll** - Feed loads more posts as you scroll
3. **Like System** - Like/unlike with instant feedback
4. **Comments** - Nested comment threads
5. **User Profiles** - Full profile pages with posts
6. **Dark Mode Ready** - Beautiful dark theme
7. **Responsive** - Works on mobile, tablet, desktop

## 📱 Test the App

Try these actions:
1. ✅ Login with admin@example.org / 1234
2. ✅ Create a new post
3. ✅ Like your post
4. ✅ Comment on your post
5. ✅ Visit your profile
6. ✅ Open another browser/incognito and login as user@example.org
7. ✅ Like and comment from the second account
8. ✅ See updates in both browsers

## 🐛 Troubleshooting

### "Cannot connect to backend"
**Solution:** Make sure your backend is running on http://localhost:4000

```bash
# In the Eco-Link-Lite folder
docker compose -f docker-compose.minimal.yml ps
```

### "Login failed"
**Solution:** Make sure the backend database is seeded:

```bash
docker compose -f docker-compose.minimal.yml exec backend yarn db:seed
```

### "Page not loading"
**Solution:** 
1. Stop the dev server (Ctrl+C)
2. Delete the `.next` folder
3. Run `npm run dev` again

## 🎨 Customize

Want to change the branding?

1. **App Name:** Edit `.env.local` → `NEXT_PUBLIC_APP_NAME`
2. **Colors:** Edit `tailwind.config.ts` → theme colors
3. **Logo:** Edit `src/components/layout/Navbar.tsx` → Logo section

## 📚 Next Steps

- [ ] Explore the code in `src/`
- [ ] Add new features
- [ ] Customize the design
- [ ] Deploy to Vercel
- [ ] Connect to production backend

## 💡 Tips

- Use **React DevTools** to inspect components
- Check **Apollo DevTools** for GraphQL queries
- Open **Network tab** to see API calls
- Press **F12** for browser console

---

**Enjoy building! 🎉**

