# 📦 Backend – Excel Analytics

This is the backend API server for the Excel Analytics platform. It supports secure file uploads (CSV, XLS, XLSX), intelligent data parsing, AI-powered insights generation, and analytics storage. Built with Express.js, MongoDB, and OpenAI integration.

## 🚀 Features

- ✅ File uploads via Multer (max 10MB)

- ✅ Supported formats: .csv, .xls, .xlsx

- ✅ Excel/CSV parsing using ExcelJS and csv-parse

- ✅ Insight generation using OpenAI (optional)

- ✅ Mongoose models for Users, Files, and Analytics

- ✅ Token-based authentication (JWT)

- ✅ REST API for analytics, files, and users

- ✅ Folder-safe user upload handling (uploads/{userId})

## 🛠️ Tech Stack

- Layer Tools/Tech
- Server Express.js
- Database MongoDB + Mongoose
- File Upload Multer + ExcelJS + csv-parse
- Auth JWT
- AI OpenAI API (optional)
- Parsing Custom parser for CSV/Excel

## 📁 Folder Structure

```bash

backend/
├── src/
│    ├── controllers/                 # Route logic (file, analytics, auth)
│    ├── models/                      # Mongoose schemas
│    ├── routes/                      # Express route definitions
│    ├── services/                    # Business logic (e.g., OpenAI)
│    ├── utils/                       # File parsers & helpers
│    └── index.js                     # App entry point
│
├── uploads/                          # Temporary upload storage (ignored)
├── .env                              # Environment secrets (ignored)
├── .gitignore
└── README.md

```

## ⚙️ Setup

1. Install dependencies

   ```bash

   cd backend
   npm install

   ```

2. Configure .env
   Create .env file based on .env.example:

```env

MONGO_DB_URI=your_mongodb_uri
JWT_SECRET=your_secret
OPENAI_API_KEY=your_key # optional, for AI insights 3. Start the dev server

```

```bash

npm run dev

```

**Server** runs on: http://localhost:5000

## 📤 API Endpoints

Will be updated here...

## 🧪 Example File Upload Flow

User uploads .xlsx or .csv

Backend parses the file using ExcelJS / csv-parse

Parsed JSON is stored along with metadata

The first 15 rows are sent to OpenAI to generate insights. (Implementation pending)

Insights + preview are returned to frontend

## 👨‍💻 Author

**Ankit Raj**

- GitHub: [@ankitraj217](https://github.com/ankitraj217)
- Email: ankitraj2095@gmail.com
