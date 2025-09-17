# 🏡 Villa Rental App  

A **full-stack villa rental platform** built with **ASP.NET Core (backend)** and **React + Vite (frontend)**.  
This project allows users to **browse, book, and review premium villas** with advanced features for customers, owners, and admins.  

---

## ✨ Features  

- 🔐 **User Authentication & Roles** – Secure JWT-based login (Customer, Owner, Admin)  
- 🏠 **Villa Listings & Management** – Owners can list and manage their villas  
- 📅 **Reservations & Payments** – Secure booking flow with payment integration  
- 📌 **Owner Upgrade Requests** – Users can request to become owners; admins approve/refuse  
- ⭐ **Advanced Review System** – Guests leave reviews with photos + verified stay badges; owners can reply  
- ❤️ **Wishlist** – Users can favorite villas and manage their list  
- 🛠️ **Admin Dashboard** – Manage villas, reservations, owner requests, and reviews  
- 🌓 **Responsive UI** – Modern, mobile-friendly design with **Dark Mode**  
- 🖼️ **Static File Serving** – Review photos & villa images served from backend  
- 📜 **Swagger API Docs** – Interactive API documentation  

---

## 🛠️ Tech Stack  

**Frontend:** React + Vite, TypeScript, TailwindCSS  
**Backend:** ASP.NET Core 9 Web API, Entity Framework Core, SQL Server  
**Authentication:** JWT (JSON Web Tokens)  
**Other Tools:** Swagger, CORS, REST API, Static File Hosting  

---

⚙️ Development Notes

Configure CORS and static file proxy in vite.config.ts for seamless local development

Use Swagger for API testing & docs (/swagger)

Ensure backend is running before starting frontend
---

## 🚀 Getting Started  

### 🔹 Backend (ASP.NET Core API)  

```bash
# 1. Install .NET 9 SDK

# 2. Configure your database connection
#    → update `appsettings.json`

# 3. Run migrations
dotnet ef database update

# 1. Install Node.js (v18+ recommended)

# 2. Install dependencies
cd client
npm install

# 3. Start the frontend
npm run dev


# 4. Start the API
dotnet run
