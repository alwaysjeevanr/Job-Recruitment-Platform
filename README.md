# Job Recruitment Platform Backend API

A modern and efficient job recruitment platform API built with Node.js, Express, and MongoDB. This platform streamlines the job search and hiring process by connecting talented job seekers with potential employers.

## Project Structure 

```
job-platform-backend/
│
├── config/
│   ├── db.js                 # MongoDB connection configuration
│   └── cloudinary.js         # Cloudinary setup for resume storage
├── controllers/
│   ├── AuthController.js     # User authentication and authorization
│   ├── JobController.js      # Job CRUD operations
│   └── ApplicationController.js # Job application handling
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── upload.js            # Resume upload handling
├── models/
│   ├── User.js              # User schema and methods
│   ├── Job.js               # Job posting schema
│   └── Application.js       # Application schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── job.js               # Job management routes
│   └── application.js       # Application routes
├── .env                     # Environment configuration
├── app.js                   # Express application setup
└── package.json             # Project dependencies
```

## Key Features

- 🔐 Secure Authentication System

  - JWT-based authentication
  - Role-based access control (Job Seekers & Employers)
  - Password encryption

- 💼 Comprehensive Job Management

  - Create and manage job postings
  - Advanced search with multiple filters
  - Pagination for better performance

- 📄 Resume Management

  - Secure resume upload via Cloudinary
  - PDF file validation
  - Automatic file optimization

- 🔍 Smart Job Search

  - Filter by location, skills, and title
  - Sort by date and relevance
  - Real-time search results

- 👥 User Management
  - Separate interfaces for job seekers and employers
  - Profile management
  - Application tracking

## Tech Stack

- **Backend Framework:** Node.js with Express
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Cloudinary
- **API Testing:** Postman
- **Version Control:** Git

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB installed and running
- Cloudinary account
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/job-platform-backend.git
cd job-platform-backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Start the development server:

```bash
npm run dev
```

## API Documentation

### Authentication

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepass123",
    "role": "jobseeker"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "securepass123"
}
```

### Jobs

#### Create Job (Employer only)

```http
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
    "title": "Senior Full Stack Developer",
    "description": "Looking for an experienced developer...",
    "location": "Mumbai, India",
    "requirements": "5+ years experience...",
    "skills": ["JavaScript", "Node.js", "React"],
    "employerId": "employer_id"
}
```

#### Search Jobs

```http
GET /api/jobs?page=1&limit=10&title=developer&location=mumbai&skills=javascript
```

### Applications

#### Apply for Job

```http
POST /api/apply
Authorization: Bearer <token>
Content-Type: multipart/form-data

jobId: "job_id"
seekerId: "seeker_id"
resume: [PDF File]
```

## Testing

1. Import the Postman collection:

   - Use `Job_Recruitment_API.postman_collection.json`
   - Set up environment variables in Postman

2. Run automated tests:

```bash
npm test
```

## Development Workflow

1. Create a new branch for your feature:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:

```bash
git add .
git commit -m "Add your feature description"
```

3. Push to your branch:

```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request

## Error Handling

The API implements comprehensive error handling:

- Input validation
- Authentication errors
- Database errors
- File upload errors
- Custom error messages

## Security Features

- Password hashing with bcrypt
- JWT token encryption
- Rate limiting
- Input sanitization
- File type validation
- Secure file storage

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
