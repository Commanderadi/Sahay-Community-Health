# 🩺 Sahay - Community Health Clinic Management System

A full-stack web application for managing community health clinics, built with React.js, Node.js, Express.js, and MongoDB.

## 🚀 Features

- **User Authentication**: JWT-based login/register system
- **Role-Based Access**: NGO, Admin, and Visitor roles
- **Clinic Management**: Add, view, search, and delete clinics
- **Search Functionality**: Search clinics by name or city
- **Responsive Design**: Modern UI with Tailwind CSS
- **Security**: Rate limiting, helmet middleware, bcrypt password hashing

## 🛠️ Tech Stack

### Frontend
- React.js 19
- Axios for API calls
- Tailwind CSS for styling
- React Router for navigation

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- Helmet for security headers
- Express Rate Limit for API protection

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sahay
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
cd client
npm install
```

#### Backend Dependencies
```bash
cd ../server
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory:
```env
MONGO_URI=mongodb://localhost:27017/sahay
JWT_SECRET=your_secret_key_here
PORT=5000
```

**Note**: Replace `your_secret_key_here` with a strong secret key for JWT tokens.

### 4. Database Setup

Make sure MongoDB is running on your system. If using MongoDB Atlas, replace the MONGO_URI with your connection string.

### 5. Start the Application

#### Start the Backend Server
```bash
cd server
npm start
```
The server will run on `http://localhost:5000`

#### Start the Frontend Application
```bash
cd client
npm start
```
The React app will run on `http://localhost:3000`

## 👥 User Roles

### NGO
- Can add new clinics
- Can delete clinics
- Can view all clinics
- Can search clinics

### Admin
- Same permissions as NGO
- Additional administrative privileges (future features)

### Visitor
- Can view all clinics
- Can search clinics
- Cannot add or delete clinics

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Clinics
- `GET /api/clinics` - Get all clinics
- `POST /api/clinics/add` - Add new clinic (protected)
- `GET /api/clinics/search?query=<search_term>` - Search clinics
- `PUT /api/clinics/:id` - Update clinic (protected)
- `DELETE /api/clinics/:id` - Delete clinic (protected)

## 🎨 UI Features

- Clean, modern interface
- Responsive design
- Real-time search functionality
- Success/error message notifications
- Role-based UI elements

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Helmet security headers
- CORS configuration
- Input validation

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check your MONGO_URI in the .env file
   - Verify network connectivity if using MongoDB Atlas

2. **JWT Token Errors**
   - Check that JWT_SECRET is set in .env
   - Ensure tokens are being sent in Authorization headers

3. **CORS Errors**
   - Verify the frontend is running on localhost:3000
   - Check CORS configuration in server/index.js

4. **Port Already in Use**
   - Change the PORT in .env file
   - Kill processes using the default ports

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository. 