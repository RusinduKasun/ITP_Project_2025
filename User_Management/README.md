# User Management System

A comprehensive user management system built with React.js, Node.js, MongoDB, and Tailwind CSS. This system provides user authentication, profile management, admin dashboard, and a modern interface.

## Features

- 🔐 **User Authentication**: Secure login and registration with username and JWT tokens
- 👤 **User Profiles**: Comprehensive user profile management
- 👑 **Admin Dashboard**: Full admin panel for user management (admin only)
- 🎨 **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- 🚀 **Real-time Updates**: Live profile updates and dashboard statistics
- 🔒 **Secure**: Password hashing with bcrypt and JWT authentication
- 📱 **Responsive**: Mobile-friendly design that works on all devices
- 🛡️ **Role-based Access**: Separate dashboards for users and admins

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** - JavaScript library for building user interfaces
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Icons** - Icon library

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd User_Management
```

### 2. Backend Setup
```bash
cd Backend
npm install
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Environment Configuration
Create a `.env` file in the Backend directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://Admin:XYrlp88D7tRsqTRG@cluster0.ucmx19s.mongodb.net/user-management
JWT_SECRET=your-secret-key
```

### 5. Create Admin User
```bash
cd Backend
node createAdmin.js
```

This will create an admin user with:
- **Username:** Idusara
- **Password:** Idusara22#@
- **Role:** admin

## Running the Application

### 1. Start the Backend Server
```bash
cd Backend
npm start
```
The backend will run on `http://localhost:5000`

### 2. Start the Frontend Development Server
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (username-based)
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/profile/picture` - Update profile picture
- `PUT /api/users/profile/password` - Change password

### Admin Routes (Admin Only)
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users with pagination and search
- `GET /api/admin/users/:userId` - Get user details
- `PUT /api/admin/users/:userId/role` - Update user role
- `PUT /api/admin/users/:userId/status` - Toggle user status
- `DELETE /api/admin/users/:userId` - Delete user

## Project Structure

```
User_Management/
├── Backend/
│   ├── Controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── adminController.js
│   ├── Middleware/
│   │   └── auth.js
│   ├── Model/
│   │   └── User.js
│   ├── Routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── adminRoutes.js
│   ├── server.js
│   ├── createAdmin.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Dashboard.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Navbar.js
│   │   │   ├── Profile.js
│   │   │   ├── ProtectedRoute.js
│   │   │   ├── AdminRoute.js
│   │   │   └── Register.js
│   │   ├── Context/
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

## Usage

### 1. User Registration
- Navigate to `/register`
- Fill in username, personal information, and password
- Click "Create Account"

### 2. User Login
- Navigate to `/login`
- Enter your username and password
- Click "Sign In"

### 3. User Dashboard
- After login, regular users are redirected to `/dashboard`
- View profile information and account statistics
- Access quick actions and account settings

### 4. Admin Dashboard
- Admin users are redirected to `/admin-dashboard` after login
- View system statistics and manage all users
- Search, filter, and paginate through users
- Change user roles, activate/deactivate users, and delete users

### 5. Profile Management
- Navigate to `/profile`
- Click "Edit Profile" to modify your information
- Update personal details, contact information, and address
- Save changes or cancel to revert

## Features in Detail

### Authentication System
- Username-based login (instead of email)
- Secure password hashing with bcrypt
- JWT token-based authentication
- Protected routes for authenticated users
- Role-based access control

### User Profile Management
- Comprehensive user information storage
- Editable profile fields
- Address management
- Profile picture support
- Password change functionality

### Admin Dashboard Features
- **System Statistics**: Total users, active users, admin count, new users
- **User Management**: View, search, filter, and paginate users
- **Role Management**: Change user roles between admin and user
- **Status Control**: Activate/deactivate user accounts
- **User Operations**: Delete users, view detailed information
- **Real-time Updates**: Live statistics and user data

### Dashboard Features
- User statistics overview
- Quick action buttons
- Account status display
- Responsive design for all devices

### Security Features
- Password validation and strength requirements
- Input sanitization and validation
- CORS protection
- Secure HTTP headers
- Role-based access control
- Admin-only routes protection

## Customization

### Styling
The application uses Tailwind CSS for styling. You can customize:
- Color scheme in `tailwind.config.js`
- Component styles in `src/index.css`
- Individual component styling

### Database Schema
The User model can be extended with additional fields:
- Profile pictures
- Social media links
- Preferences and settings
- Activity logs

### API Extensions
Add new endpoints for:
- File uploads
- Email notifications
- User analytics
- Advanced admin features

## Deployment

### Backend Deployment
1. Set environment variables
2. Use PM2 or similar process manager
3. Configure MongoDB Atlas connection
4. Set up proper CORS settings

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to hosting service (Netlify, Vercel, etc.)
3. Update API endpoints for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Future Enhancements

- [ ] Email verification system
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Advanced user roles and permissions
- [ ] Activity logging and audit trails
- [ ] API rate limiting
- [ ] File upload system
- [ ] Real-time notifications
- [ ] Advanced search and filtering
- [ ] Export functionality
- [ ] Multi-language support
- [ ] Advanced admin analytics
- [ ] Bulk user operations
- [ ] User import/export features
