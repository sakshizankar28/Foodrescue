# 🌱 FoodRescue — Surplus Food Redistribution Platform

> **Connecting commercial and institutional surplus food donors (hostels, canteens, caterers, restaurants) directly with verified NGOs to feed communities in need.**  
> A full-stack web application designed with a robust 3-tier architecture using React.js, Node.js, Express.js, and MySQL.

---

## 📌 Project Overview & Objectives

Every day, large volumes of wholesome, freshly prepared food from college mess facilities, institutional canteens, banquet halls, and restaurants are discarded due to unpredictable footfall or planned buffers. At the same time, nearby orphanages, community shelters, and daily-wage colonies face chronic food insecurity. The primary bottleneck is the lack of a real-time, transparent communication channel that can coordinate pickup logistics before food reaches its safe consumption threshold.

### Core Objectives:
1. **Zero Food Waste (UN SDG #2: Zero Hunger)**: Prevent edible food from ending up in landfills by directly connecting kitchens with charities.
2. **Real-Time Logistics Coordination**: Enable instant listing creation specifying preparation time, storage conditions (refrigerated/room temp), portion counts, and pickup deadlines.
3. **Role-Based Access Control**: Separate, dedicated interfaces and security rules for **Food Donors** and **Recipient NGOs**.
4. **Food Safety & Hygiene Transparency**: Enforce storage declarations and mandatory expiry timestamps on every food donation.
5. **Transactional Concurrency**: Prevent double-booking or over-claiming of food batches using ACID-compliant MySQL row-level locking.
6. **Zero Intermediary Overhead**: Direct telephone and location exchange between donors and NGOs upon request approval.

---

## 📁 Project Folder Structure

```
foodrescue/
│
├── package.json                        # Monorepo root scripts (build, start, dev)
├── README.md                           # Master project guide & documentation
├── Project_Report_FoodRescue.html      # Printable A4 academic project report (styled HTML)
├── setup_database.bat                  # One-click Windows batch script to initialize MySQL
│
├── database/                           # Persistence Tier
│   └── database.sql                    # MySQL 8 schema (users, food_listings, food_requests) + sample data
│
├── backend/                            # Application Tier (Node.js & Express REST API)
│   ├── config/
│   │   └── db.js                       # MySQL connection pool (mysql2/promise)
│   ├── middleware/
│   │   └── authMiddleware.js           # JWT token verification (protect) and role-guard (allowRoles)
│   ├── routes/
│   │   ├── authRoutes.js               # /api/auth endpoints (register, login, profile, bcrypt & JWT)
│   │   ├── foodRoutes.js               # /api/food endpoints (CRUD, photo upload via Multer, donor checks)
│   │   └── requestRoutes.js            # /api/requests endpoints (lifecycle & atomic MySQL quantity transactions)
│   ├── uploads/                        # Local directory where uploaded food photos are stored
│   ├── server.js                       # Express server bootstrap, middleware, and single-origin SPA hosting
│   ├── test_integration.js            # Automated 17-point end-to-end integration test suite
│   ├── .env                            # Local environment variables (DB credentials, JWT secret)
│   ├── .env.example                    # Sample environment template
│   └── package.json                    # Backend dependencies and scripts
│
└── frontend/                           # Presentation Tier (React 19 + Vite SPA)
    ├── public/                         # Static public assets (favicon.svg, icons.svg)
    ├── dist/                           # Compiled production bundle served by Express
    ├── src/
    │   ├── assets/                     # UI imagery (hero.jpg, hero.png, food1-4.jpg)
    │   ├── components/                 # Reusable UI components
    │   │   ├── Navbar.jsx              # Responsive navigation with role-based links
    │   │   ├── Footer.jsx              # Global footer & SDG #2 information
    │   │   ├── Logo.jsx                # Reusable brand SVG logo
    │   │   ├── FoodCard.jsx            # Food listing card with blurred image frame & meta tags
    │   │   ├── StatusBadge.jsx         # Colored badges (Available, Claimed, Veg, Non-Veg, etc.)
    │   │   └── RequestModal.jsx        # Modal dialog for NGOs to claim food listings
    │   ├── pages/                      # Application route views
    │   │   ├── Home.jsx                # Landing page with hero section & live impact counters
    │   │   ├── About.jsx               # Mission, workflow, and food safety standards
    │   │   ├── Contact.jsx             # Helpdesk, hotline numbers, and query form
    │   │   ├── Login.jsx               # Authentication with 1-click Quick Demo buttons
    │   │   ├── Register.jsx            # Role selector (Donor vs NGO) registration
    │   │   ├── DonorDashboard.jsx      # Donor management hub (active listings & incoming claims)
    │   │   ├── AddFood.jsx             # Donation posting form with photo upload
    │   │   ├── NGODashboard.jsx        # NGO discovery hub to browse & filter donations
    │   │   ├── MyRequests.jsx          # NGO tracking page for claimed donations
    │   │   └── Profile.jsx             # View and update user profile & phone number
    │   ├── services/
    │   │   └── api.js                  # Centralized native Fetch API client for all backend endpoints
    │   ├── App.jsx                     # Top-level client-side router & ProtectedRoute role access guards
    │   ├── App.css                     # Component-specific styles and micro-animations
    │   ├── index.css                   # Global CSS design system, variables, tokens, and resets
    │   └── main.jsx                    # React DOM root entry point
    ├── index.html                      # HTML5 template mounting <div id="root">
    ├── vite.config.js                  # Vite configuration & development proxy
    └── package.json                    # Frontend dependencies and build scripts
```

---

## 🏗️ System Architecture & Working

```
+-----------------------------------------------------------------------------------+
|                        CLIENT TIER (BROWSER: REACT 19 SPA)                        |
|   • Reusable Components: Navbar, FoodCard, StatusBadge, RequestModal              |
|   • Client-Side Routing: React Router DOM with ProtectedRoute role guards         |
|   • Networking: Centralized services/api.js injecting Bearer JWT headers          |
+-----------------------------------------------------------------------------------+
                                          |
                                 HTTP REST Requests
                           (Single Origin: localhost:3000)
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                   APPLICATION TIER (NODE.JS & EXPRESS SERVER)                     |
|   • Static Server: Serves React dist bundle & /uploads                            |
|   • Middleware: CORS, express.json(), authMiddleware (JWT protect & allowRoles)  |
|   • Routes:                                                                       |
|       - /api/auth     -> User registration, bcrypt verification, JWT signing      |
|       - /api/food     -> Listing CRUD, photo upload, donor ownership check        |
|       - /api/requests -> Claim workflow, status updates, MySQL transactions       |
+-----------------------------------------------------------------------------------+
                                          |
                               mysql2/promise Pool Queries
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                     DATA TIER (MYSQL 8.0 RELATIONAL DATABASE)                     |
|   • Database: foodrescue_db                                                       |
|   • Tables:                                                                       |
|       - users          (Accounts, hashed passwords, roles: donor / ngo)           |
|       - food_listings  (Food items, quantity, donor_id, timestamps)              |
|       - food_requests  (Claims, quantities, ngo_id, food_id, statuses)            |
+-----------------------------------------------------------------------------------+
```

### End-to-End Workflow:
1. **User Authentication**: Donors and NGOs register with their credentials. Passwords are encrypted using bcrypt (10 salt rounds) and returned with a signed 7-day JWT.
2. **Posting Surplus Food**: Donors fill out `/add-food` with food name, dietary category (Veg/Non-Veg), portion count, prepared timestamp, storage guidelines (insulated hot container/refrigerated), pickup address, expiry deadline, and a photo.
3. **Live Marketplace**: Listings are stored in MySQL and immediately displayed on the home page and NGO discovery feed with an `available` status badge.
4. **NGO Claim Request**: NGOs browse listings, filter by dietary requirements, and click *Request Food* to open the claim modal and specify servings required and pickup vehicle notes.
5. **Transactional Decrement**: When a donor approves a claim, a MySQL transaction (`SELECT ... FOR UPDATE`) safely locks the row and decrements the remaining available portion count atomically.
6. **Coordination & Handover**: The NGO is provided the donor's contact phone number and pickup location, updating the status from *accepted* to *collected* and *completed* upon handover.

---

## 🛠️ Technology Stack

| Layer | Technology | Role in FoodRescue | Why Suitable |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | React 19 | Presentation Tier | Modular component structure, reactive state hooks, virtual DOM. |
| **Routing** | React Router v7 | Single-Page Routing | Instant client-side page transitions without browser flickering. |
| **Styling** | Vanilla CSS3 | Design System | Zero-runtime CSS custom properties (`:root`), flex/grid, micro-animations. |
| **Backend Runtime** | Node.js | Application Tier | Asynchronous non-blocking event-driven runtime sharing JavaScript. |
| **REST Server** | Express.js 5 | Web Framework | Lightweight, modular routing pipelines and robust middleware. |
| **Database** | MySQL 8.0 | Relational Data Tier | ACID-compliant transactions, foreign key cascades, and row-level locking. |
| **DB Driver** | `mysql2/promise` | Connection Pooling | High-performance async/await promise queries and connection pool reuse. |
| **Authentication** | JWT + `bcryptjs` | Security | Stateless bearer tokens and 10-round salted password encryption. |
| **File Uploads** | Multer 2 | Image Storage | Streams multipart food photos to disk with MIME type & 5MB size validation. |
| **Build Tool** | Vite 8 | Compilation | Instant dev server startup and minified production bundles in `dist/`. |

---

## ⚙️ Quick Setup & Running (Single Localhost URL)

FoodRescue runs on a single unified URL: **`http://localhost:3000`**. The Express backend serves both the compiled React frontend Single Page Application (SPA) and all `/api/...` REST endpoints from the same port, completely eliminating CORS friction.

### Step 1: Database Setup (MySQL 8.0)
Make sure your MySQL Server service is running on port 3306.

**Option A (Automated on Windows):**
Double-click `setup_database.bat` in the project root, and enter your MySQL root password when prompted.

**Option B (Manual via Terminal):**
```bash
mysql -u root -p < database/database.sql
```
*Creates `foodrescue_db` and initializes the 3 relational tables with sample records.*

---

### Step 2: Configure Environment (`backend/.env`)
Verify `backend/.env` matches your local MySQL credentials:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=foodrescue_db
JWT_SECRET=foodrescue_super_secret_jwt_key_2024
CLIENT_URL=http://localhost:3000
```

---

### Step 3: Run the Application (One Command)
From the project root:

```bash
# 1. Build the production React frontend bundle
npm run build

# 2. Start the unified FoodRescue server
npm start
```

Open your browser and navigate to:
👉 **`http://localhost:3000`**

---

### Step 4: Run Automated Verification Tests
Run the 17-point end-to-end integration test suite:
```bash
node backend/test_integration.js
```
*Verifies database connectivity, auth flows, role guards, food CRUD, and atomic transaction reservations with 17/17 passing tests.*

---

## 🔑 Complete REST API Reference

### 1. Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new donor or NGO account (rejects public admin role) |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and returns signed JWT token |
| `GET` | `/api/auth/me` | Protected | Returns authenticated user profile |
| `PUT` | `/api/auth/profile` | Protected | Updates user organization name and contact phone number |

### 2. Food Listings Endpoints (`/api/food`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/food` | Public | Browse all available food listings joined with donor details |
| `GET` | `/api/food/mine` | Donor | View all food listings created by the logged-in donor |
| `GET` | `/api/food/:id` | Public | View full details of a specific food listing |
| `POST` | `/api/food` | Donor | Upload food photo and create surplus listing with storage/prep time |
| `PUT` | `/api/food/:id/status` | Donor | Update food status (`available`, `claimed`, `expired`) |
| `DELETE` | `/api/food/:id` | Donor | Delete own food listing (ownership enforced) |

### 3. Food Requests Endpoints (`/api/requests`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/requests/mine` | NGO | View all requests made by the logged-in NGO |
| `GET` | `/api/requests/incoming` | Donor | View incoming requests placed on donor's listings |
| `POST` | `/api/requests` | NGO | Submit request specifying requested quantity and pickup note |
| `PATCH` | `/api/requests/:id/status` | Donor / NGO | Approve/reject (donor) or update status to `collected` / `completed` |

---

## 🧪 Demonstration & Test Credentials

The database comes pre-loaded with verified sample accounts (password: `Password123`):

| Role | Email | Password | Intended Dashboard |
| :--- | :--- | :--- | :--- |
| **Donor** | `donor@example.com` | `Password123` | `/donor-dashboard` |
| **NGO** | `ngo@example.com` | `Password123` | `/ngo-dashboard` |

*(Quick-fill 1-click buttons are also provided on the `/login` page for easy examiner demonstration).*

---

## 🛡️ Security & Concurrency Design

1. **One-Way Password Encryption**: Passwords are never stored in plain text. Hashed with **bcryptjs** (10 salt rounds) before hitting MySQL.
2. **Stateless JWT Authorization**: Sensitive routes require an `Authorization: Bearer <token>` header verified by `authMiddleware.js`.
3. **Role-Based Guards**: Donors cannot claim food; NGOs cannot post food listings or approve requests. Public registration rejects any attempt to pass `role: 'admin'`.
4. **Data Sanitization**: Password hashes are stripped before returning user profile payloads.
5. **SQL Injection Prevention**: 100% of SQL queries use parameterized prepared statements (`?` placeholders).
6. **ACID Concurrency via Row Locking**:
   - Approving an NGO claim executes inside a MySQL transaction (`connection.beginTransaction()`).
   - Row locking (`SELECT ... FOR UPDATE`) prevents concurrent race conditions if multiple NGOs claim meals at the same second.
   - If requested quantity exceeds remaining available quantity, the transaction is automatically rolled back (`connection.rollback()`).
   - If valid, available quantity is decremented and changes are committed atomically (`connection.commit()`).
7. **File Upload Security**: Multer strictly validates MIME types (`image/jpeg`, `image/png`) and caps file size at 5MB.

---

## 🚀 Future Scope
- **Google Maps Integration**: Live transit route calculation and driver GPS tracking between donor kitchens and NGO shelters.
- **Automated SMS & WhatsApp Alerts**: Instant push notifications via Twilio notifying nearby verified NGO coordinators when surplus food is posted.
- **IoT Cold-Chain Monitoring**: Low-cost Bluetooth/Wi-Fi temperature sensors to monitor food storage safety continuously until delivery.
- **Volunteer Dispatch Network**: Crowdsourced delivery coordination allowing registered student volunteers to handle transport for small-batch donations.

---

## 📚 References & Standards
1. **React Documentation**: `https://react.dev/`
2. **Express.js Documentation**: `https://expressjs.com/`
3. **MySQL 8.0 Reference Manual**: `https://dev.mysql.com/doc/refman/8.0/en/`
4. **JWT RFC 7519 Specification**: `https://jwt.io/`
5. **FSSAI Surplus Food Recovery Regulations**: `https://www.fssai.gov.in/`
6. **Food and Agriculture Organization (FAO) – Food Loss and Waste**: `https://www.fao.org/food-loss-and-food-waste/`
