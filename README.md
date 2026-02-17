# Practice App - Quiz Reviewer

A modern web-based quiz application that automatically generates quiz questions from uploaded files (PDF, TXT, DOCX).

## Features

✅ **Admin Dashboard**
- Create user accounts and admin accounts
- Delete users
- View user management table
- Statistics overview

✅ **User Dashboard with Quiz Reviewer**
- Upload files (PDF, TXT, DOCX)
- Automatic question generation from file content
- Multiple question types:
  - **Definition questions (55%)**
  - **Identification questions (40%)**
  - **Fill-in-the-blank questions (5%)**
- Generate 5-50 questions
- Multiple choice answers (A, B, C, D)
- Detailed answer review after submission
- Shuffle questions on retry

✅ **Authentication**
- User login/signup (admin creates accounts)
- Role-based access (Admin/User)
- Session persistence

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: Browser localStorage
- **PDF Support**: PDF.js library
- **No Backend Required** - Fully client-side

## Files Included

- `index.html` - Login page
- `dashboard.html` - User dashboard with quiz reviewer
- `admin-dashboard.html` - Admin management panel
- `script.js` - Login logic
- `dashboard-script.js` - Quiz reviewer logic
- `admin-dashboard-script.js` - Admin management logic
- `style.css` - Unified styling

## Quick Start

### Local Testing
1. Open `index.html` in a web browser
2. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`

### Create Users
1. Login as admin
2. Go to Admin Dashboard
3. Use "Create New Account" form
4. Select role (User or Admin)

### Test Quiz Reviewer
1. Login as a regular user
2. Upload a PDF, TXT, or DOCX file
3. Select number of questions (5-50)
4. Click "Generate Quiz"
5. Answer questions
6. Submit to see detailed review

## Deployment Options

### Option 1: GitHub Pages (Free & Easy)
1. Push your code to GitHub
2. Create a GitHub repository
3. Go to Settings → Pages
4. Select main branch
5. Your site will be live at: `https://yourusername.github.io/Practice`

### Option 2: Netlify (Free)
1. Go to https://netlify.com
2. Sign up with GitHub
3. Create new site from git
4. Select your repository
5. Deploy automatically

### Option 3: Vercel (Free)
1. Go to https://vercel.com
2. Import your GitHub repository
3. Deploy with one click
4. Get instant HTTPS & CDN

### Option 4: Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run: `firebase init`
3. Run: `firebase deploy`
4. Your app will be live with HTTPS

### Option 5: AWS Amplify
1. Go to https://console.amplify.aws
2. Connect your GitHub repository
3. Deploy automatically
4. App is live with HTTPS

## Default Admin Credentials

```
Email: admin@example.com
Password: admin123
```

## Browser Requirements

- Chrome/Edge/Firefox (latest versions)
- JavaScript enabled
- localStorage enabled

## Features by Role

### Admin
- Create new user/admin accounts
- View all users
- Delete users
- Remove admin privileges
- View system statistics

### User
- Upload files for quiz generation
- Generate quizzes from file content
- Take quizzes
- Review answers with feedback
- Retry quizzes with shuffled questions

## Color Scheme

- Primary: #B67E7D (Coral/Mauve)
- Secondary: #5DA87A (Sage Green)
- Tertiary: #2E6B46 (Dark Green)
- Dark: #17402A (Very Dark)

## Support

For questions or issues, refer to the inline code comments or check the application logic in each JavaScript file.

---

**Ready to Deploy?** Choose your hosting provider from the options above and follow the steps!
