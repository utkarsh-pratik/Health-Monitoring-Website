# 🏥 Healthcare Management System

A full-stack healthcare management platform built with the MERN stack, featuring real-time notifications, payment integration, and AI-powered health analysis.

## ✨ Features

### 🔐 **User Management**
- Dual role system (Patients & Doctors)
- JWT-based authentication
- Comprehensive user profiles

### 👩‍⚕️ **Doctor Features**
- Profile management with specialties and experience
- Weekly availability scheduling
- Appointment management (accept/reject/cancel)
- Patient medical history access
- Real-time appointment notifications
- Payment notifications

### 🏥 **Patient Features**
- Doctor discovery with advanced filters
- Appointment booking system
- Medical history questionnaire
- Health report analysis with ML
- Favorites system for doctors
- Real-time appointment updates
- Integrated payment system

### 💳 **Payment Integration**
- Razorpay integration for consultation fees
- Secure payment processing
- Real-time payment notifications
- Payment status tracking

### 🤖 **AI Features**
- Health report analysis using ML
- OCR for document processing
- Health severity prediction
- Interactive chatbot integration

### ⚡ **Real-time Features**
- Socket.IO for live notifications
- Instant appointment updates
- Payment confirmations
- Email reminders (24hr & 1hr before appointments)

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Razorpay** for payments
- **SendGrid** for emails
- **Cloudinary** for image storage
- **Python** for ML integration

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Redux Toolkit** for state management
- **Socket.IO Client** for real-time updates
- **Razorpay Checkout** for payments

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB
- Python 3.8+ (for ML features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/utkarsh-pratik/Health-Monitoring-website.git
   cd summer_training-
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Install Python dependencies** (for ML features)
   ```bash
   pip install -r requirements.txt
   ```

5. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Fill in your environment variables in `.env`

6. **Start the application**
   ```bash
   # Start backend (from root directory)
   npm run dev

   # Start frontend (in another terminal)
   cd client
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 📋 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGODB_URL=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret

# File Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_EMAIL=your_verified_sendgrid_sender_email

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Server
PORT=5000
```

## 💳 Payment Testing

For testing payments with Razorpay:

### Test Card Details
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)
- **OTP**: 123456

### Important Notes
- UPI methods (Google Pay, PhonePe) don't work in test mode
- Use card payments or net banking for testing
- See `RAZORPAY_TEST_GUIDE.md` for detailed testing instructions

## 🏗️ Project Structure

```
summer_training-/
├── api/                          # Backend server
│   ├── controllers/              # Route controllers
│   ├── models/                   # Database schemas
│   ├── routes/                   # API routes
│   ├── middlewares/              # Custom middleware
│   ├── config/                   # Configuration files
│   └── ml/                       # Machine learning components
├── client/                       # Frontend application
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── pages/                # Route components
│   │   ├── layouts/              # Layout components
│   │   └── assets/               # Static assets
│   └── public/                   # Public files
└── requirements.txt              # Python dependencies
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Appointments
- `POST /api/appointments/book-appointment/:doctorId` - Book appointment
- `GET /api/appointments/getmyappointments` - Get patient's appointments

### Doctors
- `GET /api/doctors/available` - Get available doctors
- `POST /api/doctors/set-availability` - Set doctor availability
- `GET /api/doctors/scheduled-appointments` - Get doctor's appointments

### Payments
- `POST /api/payment/create-order/:appointmentId` - Create payment order
- `POST /api/payment/verify/:appointmentId` - Verify payment
- `GET /api/payment/status/:appointmentId` - Get payment status

## 🧪 Testing

### Running Tests
```bash
# Backend tests
npm test

# Frontend tests
cd client
npm test
```

### Payment Testing
See `RAZORPAY_TEST_GUIDE.md` for comprehensive payment testing instructions.

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use production database URL
3. Use production Razorpay keys
4. Configure production CORS settings

### Build Commands
```bash
# Build frontend
cd client
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the ISC License.

## 👥 Team

- **Developer**: Utkarsh Pratik
- **Repository**: https://github.com/utkarsh-pratik/Health-Monitoring-website.git

## 🐛 Bug Reports

If you find a bug, please create an issue with:
- Bug description
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check existing documentation
- Review the test guide for common issues

---

Made with ❤️ for better healthcare management
