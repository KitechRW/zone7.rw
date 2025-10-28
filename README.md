# Zone7.rw

A modern real estate built with Next.js, TypeScript, and Tailwind CSS that allows users to browse, buy, and rent properties in Rwanda.

## Features

- **Authentication**

  - User registration and login
  - Password reset functionality
  - Role-based access control (Admin/Broker/User)
  - Protected routes with NextAuth

- **Property Management**

  - Property listing with detailed information
  - Property search and filtering
  - Featured properties section
  - Image management with Cloudinary
  - Property statistics for admins

- **User Features**

  - User profiles
  - Property interest management
  - Contact form for inquiries
  - Responsive design for all devices

- **Admin Dashboard**
  - Property management (CRUD operations)
  - User management
  - Interest management
  - Statistics and analytics

## Tech Stack

- **Frontend**

  - Next.js 15+ with App Router
  - TypeScript
  - Tailwind CSS
  - Framer Motion for animations
  - Context API for state management

- **Backend**

  - Next.js API Routes
  - MongoDB with Mongoose
  - NextAuth.js for authentication
  - Rate limiting middleware
  - Error handling middleware

- **Services**
  - Cloudinary for image storage
  - Brevo Email service for notifications

## Project Structure

```
zone7.rw/
├── public/                  # Static assets
├── src/                     # Main source code
│   ├── app/                 # Next.js app directory (routing, pages, layouts)
│   │   ├── api/             # API routes (auth, contact, interests, properties, users)
│   │   ├── admin/           # Admin dashboard (layout, page)
│   │   ├── auth/            # Authentication pages (login, forgot/reset password)
│   │   ├── contact/         # Contact page
│   │   ├── profile/         # User profile page
│   │   ├── properties/      # Property listings and details
│   │   └── ...              # Error, not-found, providers, etc.
│   ├── components/          # React components
│   │   ├── adminTab/        # Admin dashboard tabs (InterestsTab, PropertyTab, UsersTab)
│   │   ├── layout/          # Layout components (Header, Footer, etc.)
│   │   ├── misc/            # Miscellaneous components (Avatar, Loader, etc.)
│   │   ├── modals/          # Modal components (InterestModal, PropertyModal)
│   │   └── properties/      # Property-related components (PropertyCard, PropertyGrid, etc.)
│   ├── contexts/            # React Context providers (Auth, Property, Interest, Filter)
│   ├── lib/                 # Backend logic and utilities
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # API controllers
│   │   ├── db/              # Database connection and models
│   │   ├── middleware/      # Custom middleware (auth, error, rateLimit, validation)
│   │   ├── schema/          # Validation schemas
│   │   ├── services/        # Business logic services (auth, property, email, etc.)
│   │   ├── types/           # TypeScript types for backend
│   │   └── utils/           # Utility functions (apiError, logger, password, etc.)
│   └── util/                # Utility React components (Whatsapp, YoutubeThumbnail)
├── types/                   # Global TypeScript types (Interests, Properties)
├── package.json             # Project metadata and dependencies
├── tsconfig.json            # TypeScript configuration
├── next.config.ts           # Next.js configuration
├── postcss.config.mjs       # PostCSS configuration
├── eslint.config.mjs        # ESLint configuration
└── README.md                # Project documentation
```

A modern real estate built with Next.js, TypeScript, and Tailwind CSS that allows users to browse, buy, and rent properties in Rwanda.

<<<<<<< HEAD

1. Clone the repository:

   ```bash
   git clone https://github.com/KitechRW/restate.rw.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following variables:

   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret
   MONGODB_URI=your_mongodb_uri
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   EMAIL_SERVER=your_email_server
   EMAIL_FROM=your_email_from
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Authentication

The application implements a hybrid authentication system built on NextAuth.js with customizations:

- **NextAuth Foundation**

  - JWT-based authentication
  - Session management with custom callbacks
  - Credentials provider for email/password login

- **Custom Extensions**

  - Advanced token management (access & refresh tokens)
  - Token refresh mechanism with concurrency protection
  - Role-based access control (User/Admin/Owner)
  - Device tracking and session management

- **Security Features**
  - Refresh token rotation
  - Rate limiting on sensitive endpoints
  - HTTP-only cookies for refresh tokens
  - Secure password reset flow
  - Device and user agent tracking

## API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/properties/*` - Property management
- `/api/interests/*` - Interest management
- `/api/users/*` - User management
- `/api/contact/*` - Contact form

## Context Providers

- `AuthContext` - Authentication state and methods
- `PropertyContext` - Property management state
- `InterestContext` - Interest management state
- `FilterContext` - Property filtering state

## Components

### Layout Components

- `Header` - Main navigation header
- `Footer` - Site footer
- `Welcome` - Homepage welcome section
- `Benefits` - Features and benefits section

### Property Components

- `PropertyCard` - Property preview card
- `PropertyDetails` - Detailed property view
- `PropertyGrid` - Grid layout for properties

### Admin Components

- `PropertyTab` - Property management tab
- `UsersTab` - User management tab
- `InterestsTab` - Interest management tab

## Middleware

- `authMiddleware` - Route protection
- `errorMiddleware` - Error handling
- `rateLimitMiddleware` - API rate limiting
- `validationMiddleware` - Request validation

## Services

- `authService` - Authentication logic
- `propertyService` - Property management
- `cloudinaryService` - Image upload and management
- `emailService` - Email notifications
- `resetService` - Password reset functionality

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. # Submit a pull request

## Features

- **Authentication**

  - User registration and login
  - Password reset functionality
  - Role-based access control (Admin/User)
  - Protected routes with NextAuth

- **Property Management**

  - Property listing with detailed information
  - Property search and filtering
  - Featured properties section
  - Image management with Cloudinary
  - Property statistics for admins

- **User Features**

  - User profiles
  - Property interest management
  - Contact form for inquiries
  - Responsive design for all devices

- **Admin Dashboard**
  - Property management (CRUD operations)
  - User management
  - Interest management
  - Statistics and analytics

## Tech Stack

- **Frontend**

  - Next.js 15+ with App Router
  - TypeScript
  - Tailwind CSS
  - Framer Motion for animations
  - Context API for state management

- **Backend**

  - Next.js API Routes
  - MongoDB with Mongoose
  - NextAuth.js for authentication
  - Rate limiting middleware
  - Error handling middleware

- **Services**
  - Cloudinary for image storage
  - Email service for notifications
  - Logging service

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── properties/        # Property listings and details
│   └── profile/           # User profile pages
├── components/            # React components
│   ├── adminTab/         # Admin dashboard tabs
│   ├── layout/           # Layout components
│   ├── misc/             # Miscellaneous components
│   ├── modals/           # Modal components
│   └── properties/       # Property-related components
├── contexts/             # React Context providers
├── lib/                  # Utility functions and configurations
│   ├── config/          # Configuration files
│   ├── controllers/     # API controllers
│   ├── db/             # Database models and connection
│   ├── middleware/     # Custom middleware
│   ├── schema/         # Validation schemas
│   ├── services/       # Business logic services
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
└── types/               # Global TypeScript types
```

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/KitechRW/zone7.rw
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following variables:

   ```
   NEXT_PUBLIC_COMPANY_NAME=
   NEXT_PUBLIC_COMPANY_URL=
   NEXT_PUBLIC_EMAIL=
   NEXT_PUBLIC_PHONE=
   NEXTAUTH_URL=
   NEXTAUTH_SECRET=
   MONGODB_URI=
   ADMIN_EMAIL=
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
   NEXT_PUBLIC_CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   BREVO_API_KEY=
   BREVO_FROM_EMAIL=
   BREVO_FROM_NAME=
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Authentication

The application implements a hybrid authentication system built on NextAuth.js with customizations:

- **NextAuth Foundation**

  - JWT-based authentication
  - Session management with custom callbacks
  - Credentials provider for email/password login

- **Custom Extensions**

  - Advanced token management (access & refresh tokens)
  - Token refresh mechanism with concurrency protection
  - Role-based access control (User/Admin/Owner)
  - Device tracking and session management

- **Security Features**
  - Refresh token rotation
  - Rate limiting on sensitive endpoints
  - HTTP-only cookies for refresh tokens
    <<<<<<< HEAD
  - CSRF protection
  - Input validation with Zod > > > > > > > f1e01a3 (1. MongoDB setup (#6))
    =======
  - Secure password reset flow
  - Device and user agent tracking

## API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/properties/*` - Property management
- `/api/interests/*` - Interest management
- `/api/users/*` - User management
- `/api/contact/*` - Contact form

## Context Providers

- `AuthContext` - Authentication state and methods
- `PropertyContext` - Property management state
- `InterestContext` - Interest management state
- `FilterContext` - Property filtering state

## Components Overview

- **Layout Components**: `Header`, `Footer`, `Welcome`, `Benefits`, etc.
- **Property Components**: `PropertyCard`, `PropertyDetails`, `PropertyGrid`, etc.
- **Admin Components**: `PropertyTab`, `UsersTab`, `InterestsTab`
- **Miscellaneous**: `Avatar`, `Loader`, `Dropdown`, `SearchBar`, etc.
- **Modals**: `InterestModal`, `PropertyModal`

## Middleware

- `auth.middleware.ts` - Route protection
- `error.middleware.ts` - Error handling
- `rateLimit.middleware.ts` - API rate limiting
- `validation.middleware.ts` - Request validation

## Services

- `auth.service.ts` - Authentication logic
- `property.service.ts` - Property management
- `cloudinary.service.ts` - Image upload and management
- `email.service.ts` - Email notifications
- `reset.service.ts` - Password reset functionality

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request
   > > > > > > > 48f8bee (Feature/password reset (#12))
