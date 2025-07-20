# EESA Frontend Platform

A modern, production-ready web application for the Electronics Engineering Student Association (EESA) built with Next.js 15, TypeScript, and Tailwind CSS. This platform serves students, faculty, and staff with comprehensive academic resource management and event coordination.

## 🚀 Production Features

- **🔐 Secure Authentication** - JWT-based auth with role-based access control
- **📚 Academic Resources** - Digital library with notes, textbooks, and PYQs
- **📅 Event Management** - Campus events and registration system
- **💼 Career Portal** - Job placements and career opportunities
- **🎯 Project Showcase** - Student and faculty project displays
- **📱 Responsive Design** - Mobile-first, optimized for all devices
- **⚡ Performance Optimized** - Built with Next.js 15 and modern tooling
- **🔒 Security Hardened** - XSS protection, input validation, secure file handling

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query + Context API
- **Authentication**: JWT tokens
- **Forms**: React Hook Form + Zod validation
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with automatic token refresh
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Development**: Turbopack for fast builds

## 🎭 User Roles

- **👨‍🎓 Students**: Access library, events, career board, upload notes, create projects
- **👨‍🏫 Teachers**: Student permissions + approve notes, create events
- **🎓 Alumni**: Student permissions + post career opportunities
- **⚡ Tech Heads**: Full admin access to all platform features

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd forntend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your configuration:

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   JWT_SECRET=your-jwt-secret-key-here
   NODE_ENV=development
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js 15 App Router pages
│   ├── about/          # About page
│   ├── career/         # Career opportunities
│   ├── events/         # Events & workshops
│   ├── library/        # Digital library
│   ├── login/          # Authentication
│   └── page.tsx        # Home page
├── components/         # Reusable React components
│   ├── layout/         # Layout components (Navbar)
│   └── ui/            # UI components (Button, Input)
├── contexts/          # React Context providers
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries (API client)
├── types/             # TypeScript type definitions
└── utils/             # Helper functions
```

## 🔑 Authentication

The platform uses JWT-based authentication with automatic token refresh. Demo credentials are available on the login page:

- **Student**: student@eesa.com / password123
- **Teacher**: teacher@eesa.com / password123
- **Alumni**: alumni@eesa.com / password123
- **Tech Head**: tech@eesa.com / password123

## 🎨 Design System

- **Primary Color**: Blue (#2563EB)
- **Typography**: Geist Sans & Geist Mono
- **Spacing**: Tailwind CSS spacing scale
- **Components**: Custom UI components with consistent styling
- **Icons**: Lucide React icon library

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on every push to main branch

### Manual Deployment

```bash
npm run build
npm start
```

## 🔄 API Integration

The frontend is designed to integrate with a Django REST API backend. Currently uses mock data for development. API endpoints include:

- `POST /auth/login/` - User authentication
- `POST /auth/refresh/` - Token refresh
- `GET /auth/user/` - User profile
- `GET /notes/` - Library materials
- `GET /events/` - Events listing
- `GET /career/` - Career opportunities

## 🛡️ Security Features

- JWT token storage in secure HTTP-only cookies
- Automatic token refresh
- Role-based route protection
- CSRF protection
- Environment-based configuration

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interfaces
- Optimized for all screen sizes

## 🔮 Future Enhancements

- [ ] Notes upload and verification system
- [ ] Project creation and management
- [ ] User registration flow
- [ ] File upload capabilities
- [ ] Real-time notifications
- [ ] Advanced search and filtering
- [ ] User profiles and settings
- [ ] Dark mode support

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email contact@eesa.edu or join our community Discord server.

---

**Built with ❤️ by the EESA Development Team**
