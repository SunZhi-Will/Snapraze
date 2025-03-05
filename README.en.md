<div align="center">

<img src="public/logo.png" alt="Snapraze Logo" width="120" />

# 🚀 Snapraze

### Image Processing & Storage Platform

[![Next.js](https://img.shields.io/badge/Next.js-13.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

[English](README.en.md) | [繁體中文](README.md)

</div>

## 📖 Introduction

Snapraze provides cloud storage for images, editing with annotation, and image comparison features. Users can upload, manage, edit and compare images.

https://github.com/user-attachments/assets/812f2d04-bec1-4be8-a63a-1371234dbc06

### ✨ Main Features

- 🖼️ Cloud Image Storage
  - Image upload and storage
  - Image management system
  - Multiple format support

- ✏️ Image Editing & Annotation
  - Annotation tools
  - Editing features
  - Real-time preview

- 🔍 Original vs Edited Comparison
  - Side-by-side view
  - Real-time toggle
  - Change history

## 🛠️ Technologies

- [Next.js](https://nextjs.org) - React Framework
- [TypeScript](https://www.typescriptlang.org) - JavaScript with types
- [Tailwind CSS](https://tailwindcss.com) - CSS Framework
- [Shadcn/ui](https://ui.shadcn.com) - UI Components
- [Cloudinary](https://cloudinary.com) - Cloud Image Management
- [PostgreSQL](https://www.postgresql.org) - Relational Database
- [Prisma](https://www.prisma.io) - ORM Tool
- [Fabric.js](http://fabricjs.com) - HTML5 Canvas Library

### 🌩️ Cloud Services

- **Cloudinary**
  - Image upload and storage
  - Image optimization and transformation
  - Reliable Content Delivery Network (CDN)

### 💾 Database

- **PostgreSQL**
  - User data storage
  - Image metadata management
  - Edit history tracking

### 🔐 API Routes

- `/api/upload` - Handle image uploads
- `/api/getImage` - Get image information
- `/api/deleteImage` - Delete images
- `/api/saveEdit` - Save edit states
- `/api/getCanvasState` - Get canvas state

## 📁 Project Structure

```
snapraze/
├── 📂 components/      # UI Components
│   ├── 📂 ui/         # Base UI Components
│   └── 📄 file-uploader  # File Upload Component
├── 📂 hooks/          # Custom Hooks
├── 📂 lib/           # Utility Functions
├── 📂 pages/         # Pages
└── 📂 public/        # Static Assets
```

## 🚀 Getting Started

### 1️⃣ Clone Project

```bash
git clone https://github.com/SunZhi-Will/snapraze.git
cd snapraze
```

### 2️⃣ Configure Environment Variables

Create `.env` and `.env.local` files in the project root:

```env
# .env
DATABASE_URL="postgresql://[username]:[password]@[host]:[port]/[database]?pgbouncer=true"
DIRECT_URL="postgresql://[username]:[password]@[host]:[port]/[database]"
```

```env
# .env.local
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
NEXT_PUBLIC_CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

DATABASE_URL="postgresql://[username]:[password]@[host]:[port]/[database]?pgbouncer=true"
DIRECT_URL="postgresql://[username]:[password]@[host]:[port]/[database]"
```

Replace the above variables with your actual configuration values.

### 3️⃣ Setup Prisma

1. Initialize Prisma
```bash
npx prisma init
```

2. Run database migrations
```bash
npx prisma migrate dev
```

3. Generate Prisma Client
```bash
npx prisma generate
```

### 4️⃣ Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 5️⃣ Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 💻 Development

- Modify pages in `pages` directory
- Hot reload supported
- Use components from `components` directory
- Create custom hooks in `hooks` directory

## 🌐 Deployment

Deploy using [Vercel Platform](https://vercel.com/new):

1. Push code to GitHub
2. Import project on Vercel
3. Deploy complete

## 🤝 Contributing

Contributions welcome!

1. Fork this project
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is under [MIT License](LICENSE).

---

<div align="center">

Made with ❤️ by [SunZhi-Will](https://github.com/SunZhi-Will)

</div> 
