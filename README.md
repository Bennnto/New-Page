
neasi# Page Project

A comprehensive full-stack web application with payment processing, media upload/management, user authentication, and announcements system.

## 🚀 Features

### ✅ Working Features
- **User Authentication & Session Management**
  - JWT-based authentication
  - Session tracking with device info
  - Secure password hashing
  - Protected routes

- **Payment System (Stripe Integration)**
  - Subscription management (Free, Basic, Premium, Enterprise)
  - One-time payments
  - Webhook handling
  - Payment history tracking

- **Media Upload & Management**
  - File upload with drag & drop
  - Multiple file format support (images, videos, documents)
  - Storage quota management based on subscription
  - Media categorization and tagging
  - Like and comment system

- **User Dashboard**
  - Statistics overview
  - Recent activity tracking
  - Storage usage monitoring
  - Quick actions

- **Announcements System**
  - Targeted announcements
  - Admin management
  - User engagement tracking

- **Modern Dark UI**
  - Reduced background brightness for eye comfort
  - Responsive Material-UI design
  - Beautiful gradients and animations

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Stripe** for payments
- **Multer** for file uploads
- **Socket.io** for real-time features

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for components
- **React Router** for navigation
- **TanStack Query** for data management
- **Stripe Elements** for payment UI
- **React Dropzone** for file uploads

## 📋 Prerequisites

- Node.js (v16 or later)
- MongoDB (local or cloud)
- npm or yarn
- Stripe account (for payments)

## 🚀 Quick Start

### 1. Environment Setup

#### Backend (.env)
```bash
# Copy and configure environment variables
cp env.example .env

# Edit the .env file with your settings:
MONGODB_URI=mongodb://localhost:27017/pageproject
JWT_SECRET=your_super_secret_jwt_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
PORT=5000
CLIENT_URL=http://localhost:3000
```

#### Frontend (.env)
```bash
cd client
cp .env.example .env

# Edit with your settings:
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 2. Installation

#### Backend Dependencies
```bash
npm install
```

#### Frontend Dependencies
```bash
cd client
npm install --legacy-peer-deps
```

### 3. Database Setup

Make sure MongoDB is running locally or update MONGODB_URI to point to your MongoDB instance.

### 4. Run the Application

#### Start Backend Server
```bash
npm run dev
# or
npm start
```

#### Start Frontend (in another terminal)
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
Page Project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── hooks/         # Custom hooks
├── config/                # Configuration files
├── controllers/           # Route controllers
├── middleware/           # Express middleware
├── models/               # MongoDB models
├── routes/               # API routes
├── uploads/              # File upload storage
├── server.js             # Main server file
└── package.json          # Dependencies
```

## 🔧 Key Components

### Backend Routes
- `/api/auth` - Authentication (login, register, sessions)
- `/api/payment` - Stripe payments and subscriptions
- `/api/media` - Media upload and management
- `/api/user` - User profile and dashboard
- `/api/announcements` - Announcements system

### Frontend Pages
- **Home** - Landing page with features and pricing
- **Dashboard** - User dashboard with statistics
- **Media Gallery** - Browse and discover media
- **Media Upload** - Upload files with metadata
- **Profile** - User settings and preferences
- **Subscription** - Payment and plan management

## 💳 Payment Plans

- **Free**: 10 uploads, 100MB storage, 5MB max file size
- **Basic**: 100 uploads, 1GB storage, 25MB max file size - $9.99/month
- **Premium**: 1,000 uploads, 10GB storage, 100MB max file size - $19.99/month
- **Enterprise**: Unlimited uploads/storage, 500MB max file size - $49.99/month

## 🎨 UI Features

- **Dark Theme**: Optimized for reduced eye strain
- **Responsive Design**: Works on all device sizes
- **Beautiful Animations**: Smooth transitions and hover effects
- **Modern Components**: Material-UI with custom styling

## 🔒 Security Features

- JWT authentication with refresh tokens
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure file upload handling
- CORS protection
- Helmet.js security headers

## 📊 Media Management

- **Upload**: Drag & drop or click to upload
- **Formats**: Images (JPEG, PNG, GIF, WebP), Videos (MP4, WebM), Documents (PDF)
- **Organization**: Categories, tags, and visibility settings
- **Interaction**: Like, comment, and share system
- **Analytics**: View counts and engagement metrics

## 🔔 Announcements

- **Targeted**: Send to specific users, roles, or subscription tiers
- **Scheduling**: Schedule announcements for future publication
- **Analytics**: Track views, clicks, and engagement
- **Rich Content**: Support for images, videos, and action buttons

## 🚀 Deployment

### Backend Deployment (Heroku example)
```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_connection_string
heroku config:set JWT_SECRET=your_jwt_secret

# Deploy
git push heroku main
```

### Frontend Deployment (Netlify/Vercel)
```bash
cd client
npm run build
# Deploy the build folder to your hosting service
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Check the documentation
- Create an issue on GitHub
- Contact the development team

---

**Built with ❤️ for the modern web**
