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

## Features

- **Authentication**

<<<<<<< HEAD
<<<<<<< HEAD
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

> > > > > > > # 9caa17e (initial setup)

- **Security Best Practices**:

  - Bcrypt password hashing (12 rounds)
  - JWT tokens with proper expiration
  - HTTP-only cookies for refresh tokens
  - CSRF protection
  - Input validation with Zod > > > > > > > f1e01a3 (1. MongoDB setup (#6))
    =======
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
5. Submit a pull request
   > > > > > > > 48f8bee (Feature/password reset (#12))
