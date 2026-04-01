# Complaint Portal

A comprehensive Student Complaint Portal built with a modern tech stack. Students can submit complaints, track their status, and receive feedback from administrators. Administrators can manage complaints, update statuses, and add internal comments.

## 🚀 Features

- **Authentication & Authorization**: Secure JWT-based authentication for Students and Admins.
- **Student Dashboard**: Submit complaints and view status updates in real-time.
- **Admin Dashboard**: Comprehensive overview of all complaints with status management.
- **Complaint Lifecycle**: Track complaints from `Pending` to `Seen` (by admin) and finally `Resolved`.
- **View Tracking**: Admins can see who has viewed specific complaints.
- **Modern UI**: Built with Angular 19+ and Ant Design for a premium feel.

## 🛠 Tech Stack

### Backend
- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: Passport.js with JWT Strategy
- **Validation**: Class-validator & Class-transformer

### Frontend
- **Framework**: [Angular 19+](https://angular.io/)
- **UI Components**: [NG-ZORRO](https://ng.ant.design/) (Ant Design for Angular)
- **Styling**: Tailwind CSS for responsive layouts
- **State Management**: Angular Signals

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- `npm` or `bun`

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in a `.env` file (see `.env.example` if available).
4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run start:dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Access the application at `http://localhost:4200`.

## 📜 License

This project is proprietary and confidential.

## Netlify Frontend Deployment

The frontend can now be deployed on Netlify from the repository root.

Required Netlify site setting:

```env
NETLIFY_API_BASE_URL=https://your-backend-host.example.com
```

The Netlify build uses [netlify.toml](/home/me/ProgrammingHub/mine/complaint-portal/netlify.toml) and [netlify-build.sh](/home/me/ProgrammingHub/mine/complaint-portal/frontend/scripts/netlify-build.sh) to:

- build the Angular app from `frontend/`
- copy `index.csr.html` to `index.html` for SPA hosting
- keep the frontend API base URL on `/api`
- generate a Netlify `_redirects` file that proxies `/api/*` to `NETLIFY_API_BASE_URL`

Your backend must also allow the Netlify origin:

```env
CORS_ALLOWED_ORIGINS=https://your-site.netlify.app
```
