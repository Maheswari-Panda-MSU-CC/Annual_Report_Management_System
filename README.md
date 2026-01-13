# Annual Report Management System (ARMS)

A comprehensive web-based system for managing annual reports, academic activities, research contributions, and administrative data for educational institutions. Built with Next.js 15, TypeScript, SQL Server, and AWS S3.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [AWS S3 Setup](#aws-s3-setup)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [API Routes](#api-routes)
- [Development Guidelines](#development-guidelines)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Core Functionality
- **Multi-role Authentication**: Support for Teachers, Department Heads, Faculty Deans, and University Admins
- **Profile Management**: Comprehensive teacher profile management with document uploads
- **Research Management**: Track research projects, publications, and contributions
- **Publication Management**: Manage journal articles, books, and papers
- **Research Contributions**: Track JRF/SRF, consultancy, e-content, collaborations, financial support, visits, PhD guidance, policy documents, patents, and copyrights
- **Talks & Events**: Manage academic talks, contributions, committee participation, and refresher courses
- **Awards & Recognition**: Track awards, fellowships, performance recognition, and extension activities
- **Document Management**: Secure document storage and retrieval using AWS S3
- **Activity Logging**: Comprehensive activity tracking for all S3 operations (upload, download, delete)
- **Report Generation**: Generate various reports including CV, faculty reports, AQAR reports, and more
- **Smart Document Analyzer**: AI-powered document extraction and categorization
- **CV Generation**: Automated CV generation with customizable sections

### User Roles
1. **Teacher** - Manage personal profile, research, publications, and contributions
2. **Department Head** - View and manage department-level data
3. **Faculty Dean** - Oversee faculty-wide activities and reports
4. **University Admin** - Full system administration and user management

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **TanStack Query** - Data fetching and caching
- **Lucide React** - Icons
- **React PDF** - PDF viewing and generation

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **SQL Server (MSSQL)** - Database
- **AWS S3** - Document storage
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **PostCSS** - CSS processing

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **pnpm** package manager
- **SQL Server** (2019 or higher) or SQL Server Express
- **AWS Account** (for S3 storage)
- **Git** (for version control)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Annual_Report_Management_System
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory (see [Environment Variables](#environment-variables) section)

4. **Set up the database**
   - Run the database schema script from `database-schema/ARMS_Script_11_6_25.sql`
   - Ensure SQL Server is running and accessible

5. **Configure AWS S3**
   - Follow the [AWS S3 Setup](#aws-s3-setup) guide
   - Or refer to `docs/S3_SETUP.md` for detailed instructions

6. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database Configuration
DB_HOST=your-sql-server-host
DB_PORT=1433
DB_NAME=your-database-name
DB_USER=your-database-username
DB_PASS=your-database-password

# AWS S3 Configuration
AWS_KEY=your-aws-access-key-id
AWS_SECRET=your-aws-secret-access-key
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=arms-documents
S3_PRESIGNED_URL_EXPIRY=3600

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# Email Configuration (Optional - for OTP and notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Important Notes
- Never commit `.env.local` to version control
- Use strong, unique values for `JWT_SECRET` in production
- Ensure AWS credentials have appropriate IAM permissions (see S3 Setup)

## 🗄 Database Setup

1. **Install SQL Server**
   - Download and install SQL Server 2019 or higher
   - Or use SQL Server Express (free)

2. **Create Database**
   ```sql
   CREATE DATABASE ARMS;
   ```

3. **Run Schema Script**
   - Execute the SQL script from `database-schema/ARMS_Script_11_6_25.sql`
   - This will create all necessary tables, stored procedures, and initial data

4. **Verify Connection**
   - Update `.env.local` with your SQL Server credentials
   - Test connection by running the development server

### Database Connection
The application uses a connection pool for efficient database access. Connection settings are configured in `lib/db.ts`:
- Max connections: 20
- Min connections: 2
- Connection timeout: 10 seconds
- Request timeout: 15 seconds

## ☁️ AWS S3 Setup

ARMS uses AWS S3 for secure document storage. Follow these steps:

### 1. Create S3 Bucket
1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **S3** service
3. Create a new bucket (e.g., `arms-documents`)
4. Configure region (recommended: `ap-south-1`)
5. Keep all public access blocks enabled (we use presigned URLs)

### 2. Create IAM User
1. Navigate to **IAM** → **Users** → **Add users**
2. Create user with programmatic access
3. Attach custom policy with minimum permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::arms-documents",
           "arn:aws:s3:::arms-documents/*"
         ]
       }
     ]
   }
   ```

### 3. Get Access Keys
1. Download the CSV with credentials
2. Add `AWS_KEY` and `AWS_SECRET` to `.env.local`

### 4. File Naming Patterns
The system supports 6 file naming patterns for backward compatibility:
- **Pattern 1**: `{UserID}_{RecordID}.{ext}` (Most common)
- **Pattern 2**: `{Email}.jpg` (Profile images)
- **Pattern 3**: `_{RecordID}_{FileNum}.{ext}` (Online info)
- **Pattern 4**: `{RecordID}.{ext}` (Department-level)
- **Pattern 5**: `{UserID}_{RecordID}_{MetricName}.{ext}` (Metrics)
- **Pattern 6**: `{UserID}_{FolderName}.{ext}` (Qualitative matrix)

For detailed S3 setup instructions, see `docs/S3_SETUP.md`.

## 🏃 Running the Project

### Development Mode
```bash
npm run dev
```
Starts the development server at [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

### Post-Install Script
The project includes a post-install script that copies the PDF.js worker file:
```bash
npm install
# Automatically runs: node -e "const fs=require('fs')..."
```

## 📁 Project Structure

```
Annual_Report_Management_System/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   └── change-password/
│   ├── (dashboards)/             # Dashboard pages
│   │   ├── admin/                # Admin dashboard
│   │   ├── department/           # Department dashboard
│   │   ├── faculty/              # Faculty dashboard
│   │   └── teacher/              # Teacher dashboard
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── teacher/              # Teacher-related APIs
│   │   ├── admin/                # Admin APIs
│   │   ├── s3/                   # S3 operations
│   │   └── shared/               # Shared APIs
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── forms/                    # Form components
│   ├── ui/                       # UI primitives (Radix UI)
│   ├── cv/                       # CV generation components
│   └── shared/                   # Shared components
├── lib/                          # Utility libraries
│   ├── db.ts                     # Database connection
│   ├── s3-service.ts             # S3 operations
│   ├── s3-upload-helper.ts       # S3 upload utilities
│   ├── activity-log.ts           # Activity logging
│   ├── api-auth.ts               # API authentication
│   └── utils.ts                  # General utilities
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript type definitions
├── database-schema/              # Database schema scripts
├── docs/                         # Documentation
├── public/                       # Static assets
│   ├── uploaded-document/        # Temporary upload directory
│   └── profile-images/           # Profile image storage
└── scripts/                      # Utility scripts
```

## 👥 User Roles

### Teacher (Role ID: 3)
- Manage personal profile
- Add/edit research projects
- Manage publications (journals, books, papers)
- Track research contributions
- Manage talks and events
- Add awards and recognition
- Generate CV
- View analytics

### Department Head (Role ID: 2)
- All teacher capabilities
- View department-level data
- Manage department activities
- Generate department reports
- View faculty analytics

### Faculty Dean (Role ID: 4)
- All department head capabilities
- View faculty-wide data
- Generate faculty reports
- Manage faculty-level activities

### University Admin (Role ID: 1)
- Full system access
- User management
- Year management
- Generate all reports
- System configuration
- Academic activities management
- Department management

## 🔌 API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/send-otp` - Send OTP for password reset
- `POST /api/auth/verify-otp` - Verify OTP

### Teacher APIs
- `GET/POST /api/teacher/profile` - Profile management
- `GET/POST /api/teacher/profile/image` - Profile image upload
- `GET/POST/PATCH/DELETE /api/teacher/research` - Research projects
- `GET/POST/PATCH/DELETE /api/teacher/publication/*` - Publications
- `GET/POST/PUT/DELETE /api/teacher/research-contributions/*` - Research contributions
- `GET/POST/PUT/DELETE /api/teacher/talks-events/*` - Talks and events
- `GET/POST/PUT/DELETE /api/teacher/awards-recognition/*` - Awards and recognition

### S3 Operations
- `POST /api/s3/upload` - Upload document to S3
- `POST /api/s3/download` - Download document from S3
- `POST /api/s3/delete` - Delete document from S3
- `POST /api/s3/get-signed-url` - Get presigned URL for document

### Shared APIs
- `GET /api/shared/dropdown/*` - Dropdown data endpoints

## 💻 Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow ESLint rules
- Use functional components with hooks
- Prefer named exports over default exports
- Use async/await for asynchronous operations

### File Naming
- Components: PascalCase (e.g., `DocumentViewer.tsx`)
- Utilities: camelCase (e.g., `s3-upload-helper.ts`)
- API routes: lowercase with hyphens (e.g., `route.ts`)

### Database Operations
- Always use stored procedures when available
- Use connection pool from `lib/db.ts`
- Handle errors gracefully
- Log activities using `lib/activity-log.ts`

### S3 Operations
- Use virtual paths (e.g., `upload/Category/userId_recordId.ext`)
- Always clean up temporary files after S3 upload
- Log S3 operations (upload, download, delete)
- Use presigned URLs for document access

### Activity Logging
The system logs all S3 operations:
- `S3_UPLOAD` - When files are uploaded to S3
- `S3_DOWNLOAD` - When files are downloaded from S3
- `S3_DELETE` - When files are deleted from S3

Logs are automatically created using `logActivity` or `logActivityFromRequest` functions.

### Form Handling
- Use React Hook Form for form management
- Validate with Zod schemas
- Show loading states during submission
- Handle errors gracefully
- Provide user feedback

### Error Handling
- Use try-catch blocks for async operations
- Return appropriate HTTP status codes
- Log errors for debugging
- Provide user-friendly error messages

## 🐛 Troubleshooting

### Database Connection Issues
- **Error**: "Connection timeout"
  - Check SQL Server is running
  - Verify firewall allows port 1433
  - Confirm credentials in `.env.local`
  - Check SQL Server Authentication is enabled

### S3 Upload Issues
- **Error**: "S3 is not properly configured"
  - Verify all AWS environment variables are set
  - Check AWS credentials are correct
  - Ensure bucket name matches `AWS_BUCKET_NAME`
  - Verify IAM user has correct permissions

### Build Errors
- **Error**: "Module not found"
  - Run `npm install` to install dependencies
  - Clear `.next` folder and rebuild
  - Check Node.js version (requires 18.x+)

### Port Already in Use
- **Error**: "Port 3000 is already in use"
  - Change port: `npm run dev -- -p 3001`
  - Or kill the process using port 3000

### PDF Worker Issues
- **Error**: "PDF.js worker not found"
  - Run `npm install` (post-install script should copy worker)
  - Manually copy `node_modules/pdfjs-dist/build/pdf.worker.min.js` to `public/pdf.worker.min.js`

## 📚 Additional Documentation

- [S3 Setup Guide](docs/S3_SETUP.md) - Detailed AWS S3 configuration
- [Database Schema](database-schema/) - Database structure and stored procedures
- [Document Generation Guide](scripts/document-generation-guide.md) - CV and report generation

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

[Add your license information here]

## 📧 Support

For issues, questions, or contributions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for educational institutions**

