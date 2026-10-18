# 🌱 FoodRescue — Surplus Food Redistribution Platform

> **Connecting surplus food donors (hostels, canteens, caterers, restaurants) directly with verified NGOs to feed communities in need.**
> A full-stack web application designed with a clean, beginner-friendly architecture using React.js, Node.js, Express.js, and MySQL.

---

## 📁 Project Folder Structure

```
foodrescue/
├── frontend/                     # React.js Single Page Application (Vite)
│   ├── public/                   # Static public assets
│   ├── src/
│   │   ├── assets/               # Images and visual media (hero.jpg)
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Navbar.jsx        # Top navigation with role-based routing and mobile drawer
│   │   │   ├── Footer.jsx        # Global page footer
│   │   │   ├── FoodCard.jsx      # Food card with full uncropped photo, status, and metadata
│   │   │   ├── StatusBadge.jsx   # Status indicator badge (available, claimed, accepted, etc.)
│   │   │   └── RequestModal.jsx  # Modal for NGOs to specify quantity and logistics message
│   │   ├── pages/                # Application views
│   │   │   ├── Home.jsx          # Landing page with live donations from MySQL
│   │   │   ├── About.jsx         # Mission, safety protocols, and organization story
│   │   │   ├── Contact.jsx       # Helpdesk, hotline numbers, and query form
│   │   │   ├── Login.jsx         # Secure authentication with role-based dashboard redirect
│   │   │   ├── Register.jsx      # Role selector (Donor vs NGO) registration
│   │   │   ├── DonorDashboard.jsx# Donor metrics, active listings, incoming request approvals
│   │   │   ├── NGODashboard.jsx  # NGO food discovery, search, and dietary filtering
│   │   │   ├── AddFood.jsx       # Food listing form with image upload & storage details
│   │   │   ├── MyRequests.jsx    # NGO request history, pickup coordination, and status tracking
│   │   │   └── Profile.jsx       # User profile details and contact information
│   │   ├── services/
│   │   │   └── api.js            # Centralized API client using the standard native Fetch API
│   │   ├── App.jsx               # Client-side router & ProtectedRoute role access guards
│   │   ├── App.css               # Component-specific styles and micro-animations
│   │   ├── index.css             # Design tokens, color system, and layout utilities
│   │   └── main.jsx              # React DOM entry point
│   ├── package.json              # Frontend dependencies and build scripts
│   └── vite.config.js            # Vite configuration
│
├── backend/                      # Node.js + Express.js REST API Server
│   ├── config/
│   │   └── db.js                 # MySQL connection pool (mysql2/promise)
│   ├── controllers/
│   │   ├── authController.js     # User registration, bcrypt hashing, JWT issuance, profile
│   │   ├── foodController.js     # Food listing CRUD, photo upload, storage details, owner check
│   │   └── requestController.js  # Request creation, lifecycle, and MySQL transaction reservations
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT token verification (protect) and role-guard (allowRoles)
│   │   └── uploadMiddleware.js   # Multer storage configuration for food photos (JPG/JPEG/PNG)
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── foodRoutes.js         # /api/food endpoints
│   │   └── requestRoutes.js      # /api/requests endpoints
│   ├── uploads/                  # Local directory where uploaded food photos are stored
│   ├── server.js                 # Express server bootstrap, middleware, and route mounting
│   ├── .env                      # Local environment variables (DB credentials, JWT secret)
│   ├── .env.example              # Sample environment template
│   └── package.json              # Backend dependencies and scripts
│
├── database/
│   └── database.sql              # MySQL schema (users, food_listings, food_requests) + sample data
└── setup_database.bat            # One-click Windows batch script to initialize MySQL database
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Vanilla CSS3 | Dynamic single-page application with responsive design tokens |
| **Backend** | Node.js, Express.js | REST API server handling authentication, business logic, and uploads |
| **Database** | MySQL 8.0 (`mysql2/promise`) | Relational database with foreign key cascades and transactional concurrency |
| **Authentication** | JSON Web Tokens (JWT) + bcryptjs | Stateless authorization and password hashing (10 salt rounds) |
| **File Uploads** | Multer | Multipart form-data parser saving images to local `/uploads` directory |
| **Networking** | Standard Native Fetch API | Browser Fetch in `services/api.js` (No external Axios dependency) |

---

## ⚙️ Quick Setup & Run Instructions

### Step 1: Database Setup (MySQL)
Make sure your MySQL Server service is running (e.g., MySQL 8.0 on port 3306).

**Option A (Automated on Windows):**
Double-click `setup_database.bat` in the project root, and enter your MySQL root password when prompted.

**Option B (Manual via Terminal):**
```bash
mysql -u root -p < database/database.sql
```
This automatically creates the `foodrescue_db` database and sets up the 3 relational tables (`users`, `food_listings`, `food_requests`) with initial sample data.

---

### Step 2: Backend Setup & Execution
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Verify or create your `.env` file (matching your MySQL credentials):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=foodrescue_db
   JWT_SECRET=foodrescue_super_secret_jwt_key_2024
   CLIENT_URL=http://localhost:5173
   ```
3. Install dependencies and start the server:
   ```bash
   npm install
   node server.js
   ```
   *Backend will run at: **http://localhost:5000***

---

### Step 3: Frontend Setup & Execution
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies and run the Vite development server:
   ```bash
   npm install
   npm run dev
   ```
   *Frontend will run at: **http://localhost:5173***

---

## 🔑 Complete REST API Endpoints

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new donor or NGO account (rejects public admin role) |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and returns signed JWT token |
| `GET` | `/api/auth/me` | Protected | Returns authenticated user profile |

### 2. Food Listings (`/api/food`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/food` | Public | Browse all available food listings joined with donor details |
| `GET` | `/api/food/mine` | Donor | View all food listings created by the logged-in donor |
| `GET` | `/api/food/:id` | Public | View full details of a specific food listing |
| `POST` | `/api/food` | Donor | Upload food photo and create surplus listing with storage/prep time |
| `PUT` | `/api/food/:id/status` | Donor | Update food status (`available`, `claimed`, `expired`) |
| `DELETE` | `/api/food/:id` | Donor | Delete own food listing (ownership enforced) |

### 3. Food Requests (`/api/requests`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/requests/mine` | NGO | View all requests made by the logged-in NGO |
| `GET` | `/api/requests/incoming` | Donor | View incoming requests placed on donor's listings |
| `POST` | `/api/requests` | NGO | Submit request specifying requested quantity and pickup note |
| `PATCH` | `/api/requests/:id/status` | Donor / NGO | Approve/reject (donor) or update status to `collected` / `completed` |

---

## 🧪 Demonstration & Test Credentials

The database comes pre-loaded with verified demo accounts (password: `Password123`):

| Role | Email | Password | Intended Dashboard |
| :--- | :--- | :--- | :--- |
| **Donor** | `donor@example.com` | `Password123` | `/donor-dashboard` |
| **NGO** | `ngo@example.com` | `Password123` | `/ngo-dashboard` |

---

## 🛡️ Security & Concurrency Design

1. **Password Protection**: Passwords are encrypted using **bcryptjs** with 10 salt rounds before being inserted into MySQL. Plain-text passwords are never saved.
2. **Stateless JWT Authorization**: Sensitive routes require an `Authorization: Bearer <token>` header verified by `authMiddleware.js`.
3. **Role Enforcement**: Donors cannot request food; NGOs cannot post food listings or approve requests.
4. **MySQL Transactions for Over-booking Prevention**:
   * When a donor approves a request, the backend starts a MySQL transaction (`connection.beginTransaction()`).
   * Row locking (`SELECT ... FOR UPDATE`) prevents concurrent race conditions.
   * If approved quantity exceeds remaining available quantity, the transaction is safely rolled back with `400 Bad Request`.
   * If successful, the approved servings are deducted from `available_quantity` and the transaction commits.
5. **Ownership Enforcement**: Users cannot edit or delete listings or requests belonging to other accounts.

---

*FoodRescue Project — Developed for Engineering Viva Demonstration*
