# A Project Report On
# “FOODRESCUE – SURPLUS FOOD REDISTRIBUTION PLATFORM”

**Under the Subject:**  
Web Technologies: **102506**

**Submitted by:**  
**Sakshi [Surname] : [Roll No]**

**Department of Computer Engineering**  
Maratha Vidya Prasarak Samaj’s  
**Karmaveer Adv. Baburao Ganpatrao Thakare College of Engineering, Nashik-13**  
**(Accredited by NBA)**  

**Academic Year: 2026–2027**

---

## CERTIFICATE

**Department of Computer Engineering (Accredited by NBA)**  
**Maratha Vidya Prasarak Samaj’s Karmaveer Adv. Baburao Ganpatrao Thakare College of Engineering, Nashik-13**

This is to certify that the Mini-project Report entitled  
### **“FOODRESCUE – SURPLUS FOOD REDISTRIBUTION PLATFORM”**
Submitted by: **Sakshi [Surname] (Roll No: [Roll No])**

The project work carried out by them is submitted in partial fulfillment of the requirements of the **Web Technologies (T.Y. B.Tech) Project** during the academic year **2026–2027**.

**Date:** 18/10/2026  
**Place:** Nashik  
**Course Teacher**  

---

## INDEX

| Sr. No. | Contents | Page |
| :---: | :--- | :---: |
| **1** | **Introduction of the Project** | **No. 1** |
| **2** | **Literature Survey** | **2** |
| **3** | **Design of the Project** | **3** |
| 3.1 | System Design | 3 |
| 3.2 | Block Diagram | 4 |
| 3.3 | Working of the Project | 5 |
| **4** | **Snapshots of the Project** | **6** |
| 4.1 | Home Page | 6 |
| 4.2 | Food Listings and Food Details | 7 |
| 4.3 | Donor Dashboard and Food Upload | 8 |
| 4.4 | NGO Dashboard and Request Management | 9 |
| 4.5 | User Login and Role-Based Registration | 10 |
| **5** | **Resources & Conclusion** | **11** |
| **6** | **References** | **12** |

---

## 1. INTRODUCTION OF THE PROJECT

**FoodRescue** is a full-stack web-based platform designed to bridge the gap between commercial surplus food generators—such as college mess facilities, institutional canteens, banquet halls, restaurants, and caterers—and verified Non-Governmental Organizations (NGOs) and community shelters feeding people in need.

Every day, enormous volumes of wholesome, freshly prepared food are discarded simply because of unpredictable footfall, planned banquet buffers, or administrative surplus. Simultaneously, nearby orphanages, shelter homes, and daily-wage colonies face chronic nutritional deficits. The primary bottleneck is the lack of a real-time, transparent communication channel that can coordinate pickup logistics before food reaches its consumption threshold.

FoodRescue resolves this issue by providing a centralized, role-based platform. Donors can instantly log surplus food listings specifying preparation time, storage instructions (e.g., insulated hot containers, refrigeration), available portions, and mandatory pickup expiry windows. Verified NGOs can search by locality, filter by dietary requirements (Vegetarian vs. Non-Vegetarian), claim needed quantities, and track approval and pickup logistics in real-time.

The application is engineered using a robust, decoupled three-tier architecture featuring a React 19 single-page application frontend, an asynchronous Node.js and Express.js REST API backend, and an ACID-compliant MySQL 8 relational database management system.

### Technologies Used:

1. **HTML5:** Provides the basic semantic structure of all web pages and components.
2. **CSS3:** Controls the responsive design, layout, color palette (eco-green and warm cream design tokens), and interactive transitions.
3. **JavaScript (ES6+):** Handles client-side interactivity, asynchronous promises, local storage session persistence, and application logic.
4. **React.js (v19):** Creates reusable, modular UI components, declarative state hooks, and high-performance virtual DOM rendering.
5. **React Router DOM:** Enables single-page application (SPA) client-side routing, protected navigation guards, and role-based redirects.
6. **Node.js:** Provides the cross-platform, asynchronous runtime environment for executing server-side JavaScript.
7. **Express.js:** Facilitates the creation of modular REST API endpoints, routing pipelines, and middleware handlers.
8. **MySQL 8.0 (`mysql2/promise`):** Enterprise-grade relational database storing users, food listings, and request records with transactional foreign key cascades.
9. **Fetch API & Axios:** Connects the React client to backend REST endpoints asynchronously using standard HTTP protocols.
10. **Multer Middleware:** Manages multipart form-data processing and safe storage of food verification photographs.
11. **JWT & bcryptjs:** Ensures secure stateless authentication, session tokens, and one-way salted password hashing.

---

### Objectives:
- To develop a responsive, user-friendly platform for real-time surplus food redistribution.
- To prevent edible food from ending up in landfills by directly connecting kitchens with charities.
- To provide role-based authentication and dedicated dashboards for Donors and NGOs.
- To enforce hygiene and food safety standards by logging storage conditions and mandatory expiry times.
- To implement transactional reservation logic ensuring quantities cannot be double-booked or over-claimed.
- To eliminate operational intermediaries through direct phone and pickup coordination.

---

## 2. LITERATURE SURVEY

Conventional food donation methods in institutional setups predominantly rely on informal WhatsApp groups, occasional telephone directories, or irregular volunteer drives. While well-intentioned, these manual channels suffer from severe latency: by the time an NGO learns about surplus food, the safe consumption window has often elapsed. Furthermore, there is no verification of storage conditions, leading to potential food safety hazards, nor any mechanism to prevent multiple organizations from arriving for the same limited batch.

Commercial food-tech apps (such as food delivery services) prioritize monetized transactions and express packaging, offering no workflow for non-profit surplus redistribution. Specialized charity initiatives exist in select metropolitan cities, but often mandate complex corporate contracts or centralized warehouse logistics, rendering them inaccessible to everyday college hostels and local canteens.

FoodRescue addresses these shortcomings by deploying a lightweight, hyper-local web architecture. By combining instant listing creation, strict expiry timestamps, transparent portion counts, and direct contact numbers, the platform delivers zero-cost food recovery that can be operated seamlessly by mess staff and local shelter coordinators alike.

The project also demonstrates the practical application of modern web technologies. React delivers responsive UI components, React Router DOM supports fluid navigation, Express.js organizes RESTful endpoints, and MySQL ensures transactional reliability.

---

## 3. DESIGN OF THE PROJECT

### 3.1 System Design

FoodRescue is implemented using a **Three-Tier Decoupled Architecture**:

1. **Presentation Tier (Frontend):**  
   Developed using React.js (Vite), CSS3, and React Router DOM. It contains the public landing page, interactive food discovery listings, donor and NGO registration forms, role-specific dashboards, and pickup coordination modals.

2. **Application Tier (Backend API):**  
   Built on Node.js and Express.js. Serves as the central controller handling HTTP requests, user authentication via JSON Web Tokens (JWT), role verification (`donor` vs. `ngo`), input validation, and file uploads via Multer.

3. **Data Tier (Database):**  
   Maintained in MySQL 8 (`foodrescue_db`). Employs three primary relational entities:
   - `users`: Stores registered donors and verified NGOs with bcrypt password hashes.
   - `food_listings`: Contains food items, portion quantities, storage instructions, expiry timestamps, and donor foreign keys (`ON DELETE CASCADE`).
   - `food_requests`: Tracks claim requests, requested quantities, coordinator messages, and fulfillment statuses.

---

### 3.2 Block Diagram

```
+-----------------------------------------------------------------------------------+
|                                  USER ROLES                                       |
|            [ Food Donors (Hostels/Canteens) ]   |   [ Recipient NGOs ]            |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                                  WEB BROWSER                                      |
|                       (Google Chrome / Edge / Firefox)                            |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                    CLIENT TIER: REACT 19 SPA (VITE)                               |
|   • Reusable Components (Navbar, FoodCard, StatusBadge, RequestModal)             |
|   • Client-Side Routing (React Router DOM: ProtectedRoute, Role Guards)           |
|   • State & Session Management (Local Storage & Fetch API)                        |
+-----------------------------------------------------------------------------------+
                                          |
                                HTTP REST Requests (JSON / Multipart)
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|               APPLICATION TIER: NODE.JS & EXPRESS.JS SERVER                       |
|   • Middleware: CORS, express.json(), authMiddleware (JWT protect & allowRoles)  |
|   • Multer Storage: Multipart image parser saving photos to /uploads              |
|   • REST Controllers:                                                             |
|       - authController.js    (/api/auth: register, login, profile)                |
|       - foodController.js    (/api/food: get all, add listing, delete)            |
|       - requestController.js (/api/requests: create request, approve, complete)  |
+-----------------------------------------------------------------------------------+
                                          |
                              mysql2/promise Pool Queries
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                  DATA TIER: MYSQL 8.0 RELATIONAL DATABASE                         |
|   • Database: foodrescue_db                                                       |
|   • Table 1: users (id, name, email, phone, password_hash, role)                  |
|   • Table 2: food_listings (id, donor_id, food_name, quantity, expiry, status)   |
|   • Table 3: food_requests (id, food_id, ngo_id, requested_qty, message, status)  |
+-----------------------------------------------------------------------------------+
```

---

### 3.3 Working of the Project

1. **User Authentication & Role Assignment:**  
   Donors (mess operators, caterers) and NGOs register with their credentials and contact information. Passwords are encrypted using bcrypt (10 salt rounds) and returned with a secure JWT.
2. **Posting Surplus Food:**  
   Donors click *Add Food*, specify food title, dietary type (Veg/Non-Veg), portion count, prepared timestamp, storage guidelines (e.g. insulated hot container / refrigerated), pickup address, and expiry limit.
3. **Instant Live Publication:**  
   The backend stores the record in MySQL and immediately serves it on the home page and NGO discovery board with an active `available` badge.
4. **NGO Search & Request Initiation:**  
   NGOs filter listings by food type or location. Clicking *Request Food* opens a modal to specify portion requirements and logistics pickup notes.
5. **Transactional Quantity Decrement:**  
   The backend validates requested quantities against available stock in MySQL, preventing over-commitment.
6. **Donor Approval & Logistics Coordination:**  
   Donors view incoming requests in their dashboard, inspect NGO messages, and click *Accept*. Both parties coordinate pickup via phone, marking the listing *Claimed/Completed* upon handover.

---

## 4. SNAPSHOTS OF THE PROJECT

### 4.1 Home Page
The Home Page provides an immediate introduction to the FoodRescue mission. It highlights real-time impact metrics (Meals Saved: 5,000+, Canteens: 45+, Partner NGOs: 30+, Cost to Shelters: 0 ₹), a dynamic surplus food feed loaded directly from MySQL, and a 3-step operational guide.

### 4.2 Food Listings & Detailed View
The discovery interface showcases active food donations. Each card prominently displays:
- Food name and dietary type badge (Veg in Green, Non-Veg in Red)
- Real uncropped food photo verification
- Available servings and storage conditions
- Preparation timestamp and safe consumption window
- Donor institution name and direct contact hotline

### 4.3 Donor Dashboard & Food Upload
The Donor Dashboard enables kitchen staff to:
- Monitor surplus metrics (Total Listings, Active, Pending Requests, Completed)
- Fill out the *Add Food* form with photo upload
- Accept or reject incoming claims with instant UI status feedback
- Delete or update completed listings

### 4.4 NGO Dashboard & Request Modal
The NGO view allows charities to browse exclusively available surplus food, apply dietary filters, submit portion claim requests with driver vehicle details, and track pickup statuses from *pending* to *accepted* and *completed*.

### 4.5 User Login and Role-Based Registration
Features secure authentication gateways that enforce role separation. Donors and NGOs enter their registered email and password to access their respective specialized workspaces.

---

## 5. CONCLUSION

**FoodRescue** establishes an effective, scalable, and socially transformative solution to the dual crises of institutional food waste and community hunger. By leveraging modern full-stack web technologies, the platform transforms what was previously an uncoordinated, error-prone manual process into an automated, transparent redistribution pipeline.

The project successfully demonstrates the integration of a React 19 single-page interface with a responsive, modern design system, seamless client-side routing via React Router DOM, and a hardened Express.js REST API backed by an ACID-compliant MySQL relational database. The implementation of role-based dashboards, secure JWT authorization, transaction-safe quantity decrementing, and photo validation safeguards hygiene and logistical accountability at every step.

### Future Scope:
- **Google Maps Platform Integration:** Automated calculation of optimal transit routes, distance radii, and live driver tracking between donor kitchens and NGO shelters.
- **Automated SMS & WhatsApp Alerts:** Push notifications via Twilio notifying nearby verified NGO volunteers within seconds of a new surplus posting.
- **IoT Cold-Chain Sensors:** Integration with low-cost Bluetooth/Wi-Fi temperature sensors to monitor food storage safety continuously until delivery.
- **Volunteer Dispatch Network:** Crowdsourced delivery coordination allowing registered student volunteers to handle transport for small-batch donations.

---

## 6. REFERENCES

1. **MDN Web Docs – HTML, CSS, and JavaScript Standards:**  
   `https://developer.mozilla.org/`
2. **React Official Documentation & Component Architecture:**  
   `https://react.dev/`
3. **React Router DOM Documentation:**  
   `https://reactrouter.com/`
4. **Node.js Asynchronous Runtime Documentation:**  
   `https://nodejs.org/docs/`
5. **Express.js REST API Framework:**  
   `https://expressjs.com/`
6. **MySQL 8.0 Reference Manual (ACID & Foreign Keys):**  
   `https://dev.mysql.com/doc/refman/8.0/en/`
7. **JWT (JSON Web Tokens) RFC 7519 Specification:**  
   `https://jwt.io/introduction`
8. **Food and Agriculture Organization (FAO) – Food Loss and Waste Database:**  
   `https://www.fao.org/food-loss-and-food-waste/`
9. **FSSAI Surplus Food Recovery Regulations:**  
   `https://www.fssai.gov.in/`
