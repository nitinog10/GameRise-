# GameRise Setup Guide

Complete step-by-step setup instructions for the GameRise platform.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- AWS Account with DynamoDB access

## Step 1: AWS DynamoDB Setup

### Create DynamoDB Table

1. Go to AWS Console → DynamoDB → Tables → Create table
2. Configure the table:
   - **Table name**: `gamerise-users`
   - **Partition key**: `userId` (String)
   - Leave other settings as default
   - Click "Create table"

### Create Global Secondary Index (GSI) for Email

After the table is created:

1. Click on your `gamerise-users` table
2. Go to the "Indexes" tab
3. Click "Create index"
4. Configure:
   - **Partition key**: `email` (String)
   - **Index name**: `email-index`
   - **Projected attributes**: All
5. Click "Create index"

Wait for the index status to become "Active" (takes 1-2 minutes).

### Get AWS Credentials

1. Go to AWS Console → IAM → Users
2. Click "Create user"
3. **User name**: `gamerise-backend` (or any name you prefer)
4. Click "Next"
5. Select "Attach policies directly"
6. Search and select: `AmazonDynamoDBFullAccess`
7. Click "Next" → "Create user"
8. Click on the newly created user
9. Go to "Security credentials" tab
10. Click "Create access key"
11. Select "Application running outside AWS"
12. Click "Next" → "Create access key"
13. **IMPORTANT**: Copy and save both:
    - Access Key ID
    - Secret Access Key
    (You won't be able to see the secret again!)

## Step 2: Backend Setup

```bash
cd backend
npm install
```

### Configure Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

Edit `backend/.env` with your values:
```
PORT=5000
JWT_SECRET=your_random_secret_key_min_32_chars
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
DYNAMO_TABLE_USERS=gamerise-users
```

### Start Backend Server

```bash
npm run dev
```

Server should start on http://localhost:5000

Test health check:
```bash
curl http://localhost:5000/api/test
```

## Step 3: Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

### Configure Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

Edit `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5000
```

### Start Frontend

```bash
npm start
```

Frontend should open at http://localhost:3000

## Step 4: Test the Application

1. Go to http://localhost:3000
2. Click "Register" and create a new account
3. Login with your credentials
4. You should see the "GameRise - Coming Soon" home page

## Troubleshooting

### DynamoDB Connection Issues

- Verify AWS credentials are correct
- Check AWS region matches your DynamoDB table region
- Ensure IAM user has DynamoDB permissions

### Email Already Exists Error

- Make sure the `email-index` GSI is created and Active
- Check DynamoDB table for duplicate emails

### CORS Errors

- Verify backend is running on port 5000
- Check frontend .env has correct API URL
- Ensure backend CORS is set to http://localhost:3000

### JWT Errors

- Make sure JWT_SECRET is set in backend .env
- JWT_SECRET should be at least 32 characters long

## What is GSI (Global Secondary Index)?

A GSI allows you to query DynamoDB by fields other than the primary key. 

In our case:
- Primary key is `userId` (auto-generated)
- We need to find users by `email` during login
- GSI on `email` enables fast email lookups without scanning the entire table

Think of it like adding an index in SQL databases for faster queries.

## Project Structure

```
gamerise/
├── backend/
│   ├── config/db.js          # DynamoDB connection
│   ├── models/User.js         # User model with DynamoDB operations
│   ├── routes/auth.js         # Auth endpoints (register/login)
│   ├── middleware/errorHandler.js
│   ├── server.js              # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/PrivateRoute.js
│   │   ├── context/AuthContext.js
│   │   ├── pages/Login.js
│   │   ├── pages/Register.js
│   │   ├── pages/Home.js
│   │   ├── utils/axios.js     # API client with JWT interceptor
│   │   └── App.js
│   └── package.json
└── data/games/                # Game data JSON files
```

## Next Steps

- Add more game data to `data/games/`
- Build player profile pages
- Add tournament features
- Implement team management
