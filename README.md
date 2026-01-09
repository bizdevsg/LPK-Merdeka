# LPK Merdeka

LPK Merdeka is a comprehensive web platform for Job Training Institutions (Lembaga Pelatihan Kerja) designed to provide information about training programs, activity galleries, testimonials, and support services. Built with modern web technologies to ensure fast performance and responsive user interface.

## 🚀 Key Features

### Landing Page
- **Hero Section**: Eye-catching main display with key information
- **Training Programs**: Complete list of available training programs
- **Gallery**: Photo and video documentation of training activities and events
- **Testimonials**: Reviews from alumni and training participants
- **FAQ**: Frequently asked questions (General & Registration categories)
- **Articles**: Training-related articles and news content

### Admin Dashboard
- **Admin Management**: Manage admin accounts (SuperAdmin only)
- **User Management**: Manage user data and accounts
- **Attendance Management**: Training participant attendance system
- **Landing Page CMS**:
  - Gallery: Manage photo and video galleries
  - Testimonials: Manage user testimonials
  - FAQ: Manage frequently asked questions (General & Registration categories)
  - Settings: Website configuration
- **Content CMS**:
  - Articles: Manage articles and news

### User Dashboard
- **Profile**: Manage user profile information
- **Attendance**: View attendance history

### Authentication System
- User login and registration
- Role-based access control (SuperAdmin, Admin, User)
- Session management with NextAuth.js

## 🛠 Tech Stack

This project is built using the following technologies:

- **[Next.js](https://nextjs.org/)**: React framework for production (using Pages Router)
- **[React](https://react.dev/)**: JavaScript library for building user interfaces
- **[TypeScript](https://www.typescriptlang.org/)**: JavaScript superset with static typing
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)**: Library for smooth and interactive animations
- **[Prisma](https://www.prisma.io/)**: Modern ORM for database management
- **[MySQL](https://www.mysql.com/)**: Relational database
- **[NextAuth.js](https://next-auth.js.org/)**: Authentication for Next.js
- **Icons**: Using `lucide-react`, `react-icons`, and `@fortawesome`

## 📂 Project Structure

The source code is organized using a **section-based component structure** for better maintainability and scalability:

```bash
src/
├── components/
│   ├── shared/          # Reusable components across all sections
│   │   ├── atoms/       # Basic UI elements (Button, Input, Heading, etc.)
│   │   ├── molecules/   # Combined atoms (FormField, LineHeading, etc.)
│   │   ├── organisms/   # Complex components (Navbar, Footer, SplashScreen)
│   │   └── Layout.tsx   # Main layout wrapper
│   ├── home/            # Home page specific components
│   ├── about/           # About page components
│   ├── program/         # Program page components
│   ├── syllabus/        # Syllabus page components
│   ├── contact/         # Contact page components
│   ├── gallery/         # Gallery components
│   ├── leaderboard/     # Leaderboard components
│   ├── dashboard/       # User dashboard components
│   └── admin/           # Admin dashboard components
├── pages/               # Next.js page routing
│   ├── api/             # API Routes
│   │   ├── auth/        # Authentication API
│   │   ├── admin/       # Admin API endpoints
│   │   └── cms/         # CMS API endpoints
│   ├── auth/            # Login/Register pages
│   ├── admin/           # Admin Dashboard pages
│   ├── dashboard.tsx    # User Dashboard page
│   └── ...              # Other pages (about, program, etc.)
├── styles/              # Global style configuration
├── context/             # React Context for state management
└── lib/                 # Utility functions and helpers
prisma/
├── schema.prisma        # Database schema
└── migrations/          # Database migrations
```

### Component Organization Philosophy

- **Section-based**: Each major feature/page has its own folder with dedicated components
- **Atomic Design within sections**: Each section follows atoms → molecules → organisms hierarchy
- **Shared components**: Common UI elements are centralized in the `shared/` folder
- **Template files**: Each section has a main template file (e.g., `HomeTemplate.tsx`) that composes the page

## 📦 Getting Started

Follow these steps to run the project on your local machine:

### 1. Clone Repository

```bash
git clone https://github.com/ahqsa24/lpk-merdeka.git
cd lpk-merdeka
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Setup Environment Variables

Create a `.env` file in the project root and configure the following:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/lpk_backpanel"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Setup Database

Run database migrations to create the required tables:

```bash
npx prisma migrate dev
```

Or if you want to reset the database and run all migrations:

```bash
npx prisma migrate reset
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. (Optional) Seed Database

If seed data is available, run:

```bash
npx prisma db seed
```

### 7. Run Development Server

```bash
npm run dev
```

### 8. Open in Browser

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🗄️ Database Schema

This project uses MySQL with Prisma ORM. Here are the main tables:

### Core Tables
- **users**: User data (roles: user, admin, superAdmin)
- **sessions**: Session management for authentication
- **attendance_sessions**: Attendance sessions
- **attendance_records**: User attendance records

### CMS Tables
- **cms_gallery**: Photo and video gallery
- **cms_faq**: FAQ with categories (General, Registration)
- **cms_testimonials**: User testimonials
- **cms_settings**: Website settings
- **cms_articles**: Articles and news

For detailed schema information, see `prisma/schema.prisma`.

## 📜 Available Scripts

- `npm run dev`: Run the development server
- `npm run build`: Build the application for production
- `npm run start`: Run the production server after building
- `npm run lint`: Run the linter to check code quality

## 🔐 User Roles

This project has 3 user roles:

1. **User**: Regular users with access to user dashboard
2. **Admin**: Administrators with access to admin dashboard for content management
3. **SuperAdmin**: Highest level administrator with full access including admin management

## 📚 Additional Documentation

- [Database Migration Guide](./docs/DATABASE_MIGRATION.md)
- [Database Schema Documentation](./docs/DATABASE_SCHEMA.md)

## 🛠️ Development Tools

### Prisma Studio

To view and manage data with a GUI:

```bash
npx prisma studio
```

This will open a browser at `http://localhost:5555` with an interface to:
- Browse all tables
- Create, Read, Update, Delete records
- Filter and search data

### Database Migrations

```bash
# Check migration status
npx prisma migrate status

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## 🤝 Contributing

To contribute to this project:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Issue**: `EPERM: operation not permitted` when running Prisma commands

**Solution**: Stop the development server before running Prisma commands, then restart it.

**Issue**: Database connection failed

**Solution**: 
1. Ensure MySQL server is running
2. Check credentials in `.env` file
3. Verify database exists: `CREATE DATABASE lpk_backpanel;`

**Issue**: Migration failed to apply

**Solution**: 
1. Backup your data
2. Review the migration SQL file
3. If needed, reset database: `npx prisma migrate reset`

## 📝 License

This project is developed for internal use by LPK Merdeka.

## 👥 Team

Developed by the LPK Merdeka IT Team.

---

For questions or issues, please contact the LPK Merdeka IT Team.
