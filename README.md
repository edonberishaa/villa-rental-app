Villa Rental App
A full-stack villa rental platform built with ASP.NET Core (backend) and React + Vite (frontend).
This project enables users to browse, book, and review premium villas, with advanced features for owners and admins.

Features
User Authentication & Roles: Register, login, and secure role-based access (Customer, Owner, Admin).
Owner Upgrade Requests: Users can request to become owners; admins can approve/refuse requests.
Villa Listings & Submissions: Owners can list and manage their properties.
Reservations & Payments: Secure booking and payment integration.
Advanced Review System: Guests can leave reviews with photos, “verified stay” badges, and owners can respond.
Wishlist: Users can favorite villas and manage their wishlist.
Admin Dashboard: Admins can manage villas, reservations, submissions, owner requests, and reviews.
Responsive UI: Modern, mobile-friendly design with dark mode.
Static File Serving: Review photos and villa images are served from the backend.
JWT Authentication: Secure API access for all endpoints.
Swagger API Docs: Interactive API documentation for backend endpoints.

Getting Started

Backend (.NET API)

1.Install .NET 9 SDK.
2.Configure your database connection in appsettings.json.
3.Run migrations:
dotnet ef database update

4.Start the API:
dotnet run

Frontend (React + Vite)

1.Install Node.js (v18+ recommended).
2.Install dependencies:
cd client
npm install

3.Start the frontend:
npm run dev

4.Access the app at http://localhost:5173.

Development Notes
Configure CORS and static file proxy in vite.config.ts for seamless local development.
Use Swagger at /swagger for API testing and documentation.
