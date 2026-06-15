# SterlingPro Invoice Management System - Backend

Internal invoice management system backend API built with Node.js, Express, and MongoDB.

## Features

- JWT Authentication
- Role-based access control (OWNER, ACCOUNTANT, STAFF)
- Invoice CRUD operations
- Client management
- Bank details management
- CSV & Excel export
- PDF invoice generation
- Email notifications
- Audit logging
- Auto invoice numbering
- Overdue tracking

## Tech Stack

- Node.js
- Express
- MongoDB (Atlas)
- Mongoose
- JWT
- Nodemailer
- Puppeteer (PDF generation)
- ExcelJS (Excel export)
- JSON2CSV (CSV export)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB Atlas credentials and other settings

4. Start development server:
```bash
npm run dev
```

## Environment Variables
```
NODE_ENV=development
PORT=5000

MONGODB_URI=your_mongodb_atlas_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=noreply@sterlingpro.com

FRONTEND_URL=http://localhost:5173

INVOICE_PREFIX=INV
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register user
- POST /api/auth/login - Login
- GET /api/auth/me - Get current user
- POST /api/auth/forgot-password - Request password reset
- POST /api/auth/reset-password/:resetToken - Reset password
- PUT /api/auth/profile - Update profile
- PUT /api/auth/change-password - Change password
- GET /api/auth/users - Get all users (OWNER only)
- PUT /api/auth/users/:id/role - Update user role (OWNER only)
- DELETE /api/auth/users/:id - Delete user (OWNER only)

### Clients
- POST /api/clients - Create client (OWNER, ACCOUNTANT)
- GET /api/clients - Get all clients
- GET /api/clients/:id - Get client by ID
- PUT /api/clients/:id - Update client (OWNER, ACCOUNTANT)
- DELETE /api/clients/:id - Delete client (OWNER, ACCOUNTANT)

### Invoices
- POST /api/invoices - Create invoice (OWNER, ACCOUNTANT)
- GET /api/invoices - Get all invoices
- GET /api/invoices/stats - Get invoice statistics
- GET /api/invoices/:id - Get invoice by ID
- PUT /api/invoices/:id - Update invoice (OWNER, ACCOUNTANT)
- DELETE /api/invoices/:id - Delete invoice (OWNER, ACCOUNTANT)
- POST /api/invoices/:id/send - Send invoice email (OWNER, ACCOUNTANT)
- POST /api/invoices/:id/duplicate - Duplicate invoice (OWNER, ACCOUNTANT)

### Export
- GET /api/export/invoices?format=csv&status=Paid - Export invoices (OWNER, ACCOUNTANT)

### Settings
- POST /api/settings/banks - Create bank (OWNER)
- GET /api/settings/banks - Get all banks
- GET /api/settings/banks/default - Get default bank
- PUT /api/settings/banks/:id - Update bank (OWNER)
- DELETE /api/settings/banks/:id - Delete bank (OWNER)
- PUT /api/settings/banks/:id/set-default - Set default bank (OWNER)

## Project Structure
```
backend/
├── src/
│   ├── config/          # Database and mail configuration
│   ├── models/          # Mongoose models
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middlewares/     # Custom middlewares
│   ├── utils/           # Utility functions
│   ├── validators/      # Input validation
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── .env                # Environment variables
├── package.json
└── README.md
```

## License

Private - Internal Use Only