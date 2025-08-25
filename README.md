# Marigold Catering Backend API

A Node.js/Express backend API with MongoDB for the Marigold Catering website and CRM system.

## Features

- 🔐 JWT Authentication (Single Admin User)
- 📝 Contact Form Management
- 📊 CRM Dashboard with Statistics
- 🛡️ Security Middleware (Helmet, CORS, Rate Limiting)
- ✅ Input Validation
- 📱 RESTful API Design
- 🗄️ MongoDB Integration

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://kampremiumyt:CfBF6Rsm3FLwwQxy@cluster0.moaux.mongodb.net/marigold_catering_crm?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRES_IN=7d

# CRM Admin Credentials (Single User)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 3. Start the Server

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/login` - Admin login
- `POST /api/auth/verify` - Verify JWT token

### Contacts

- `POST /api/contacts` - Submit contact form (Public)
- `GET /api/contacts` - Get all contacts (Admin)
- `GET /api/contacts/stats` - Get contact statistics (Admin)
- `GET /api/contacts/:id` - Get single contact (Admin)
- `PUT /api/contacts/:id` - Update contact (Admin)
- `DELETE /api/contacts/:id` - Delete contact (Admin)

### Health Check

- `GET /api/health` - Server health status

## Database Schema

### Contact Model

```javascript
{
  name: String (required),
  email: String (required),
  phone: String (optional),
  eventType: String (required) - ['wedding', 'corporate', 'social', 'other'],
  message: String (required),
  status: String - ['new', 'contacted', 'in_progress', 'completed', 'cancelled'],
  priority: String - ['low', 'medium', 'high'],
  notes: String (optional),
  contactedAt: Date (optional),
  followUpDate: Date (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Auth Rate Limiting**: 5 login attempts per 15 minutes per IP
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Express-validator
- **JWT Authentication**: Secure token-based auth

## Admin Credentials

Default credentials (change in production):

- Username: `admin`
- Password: `MarigoldAdmin2024!`

## Development

### Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── validation.js        # Input validation
├── models/
│   └── Contact.js           # Contact schema
├── routes/
│   ├── auth.js              # Authentication routes
│   └── contacts.js          # Contact management routes
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
├── README.md               # This file
└── server.js               # Main server file
```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## MongoDB Database

The API connects to MongoDB Atlas with the database name `marigold_catering_crm`. This ensures your data is separate from any existing test databases.

## Error Handling

The API includes comprehensive error handling with:

- Global error handler
- Validation error responses
- Proper HTTP status codes
- Development vs production error messages

## Next Steps

1. Install dependencies: `npm install`
2. Set up your `.env` file with the provided MongoDB URI
3. Start the development server: `npm run dev`
4. Test the API endpoints using Postman or similar tool
5. Integrate with your React frontend
