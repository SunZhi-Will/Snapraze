<div align="center">

<img src="public/logo.png" alt="Snapraze Logo" width="120" />

# 🚀 Snapraze

### 圖片處理與儲存平台

[![Next.js](https://img.shields.io/badge/Next.js-13.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

[English](README.en.md) | [繁體中文](README.md)

</div>

## 📖 專案介紹

Snapraze提供圖片雲端儲存、編輯標記以及原圖比對功能。使用者可以上傳、管理、編輯和比較圖片。

https://github.com/user-attachments/assets/76b92794-7f5d-4fbe-8800-994a4a386cd3

### ✨ 主要功能

- 🖼️ 雲端圖片儲存
  - 圖片上傳與儲存
  - 圖片管理系統
  - 支援多種圖片格式

- ✏️ 圖片編輯與標記
  - 標記工具
  - 編輯功能
  - 即時預覽

- 🔍 原圖與編輯圖比對
  - 並排比對
  - 即時切換
  - 修改記錄

## 🛠️ 使用技術

- [Next.js](https://nextjs.org) - React框架
- [TypeScript](https://www.typescriptlang.org) - JavaScript的超集
- [Tailwind CSS](https://tailwindcss.com) - CSS框架
- [Shadcn/ui](https://ui.shadcn.com) - UI組件庫
- [Cloudinary](https://cloudinary.com) - 雲端圖片管理服務
- [PostgreSQL](https://www.postgresql.org) - 關聯式資料庫
- [Prisma](https://www.prisma.io) - ORM工具
- [Fabric.js](http://fabricjs.com) - HTML5 Canvas函式庫

### 🌩️ 雲端服務

- **Cloudinary**
  - 提供圖片上傳與儲存
  - 支援圖片優化與轉換
  - 可靠的內容傳遞網路(CDN)

### 💾 資料庫

- **PostgreSQL**
  - 儲存使用者資料
  - 管理圖片元數據
  - 追蹤編輯歷史記錄

### 🔐 API 路由

- `/api/upload` - 處理圖片上傳
- `/api/getImage` - 獲取圖片資訊
- `/api/deleteImage` - 刪除圖片
- `/api/saveEdit` - 儲存編輯狀態
- `/api/getCanvasState` - 獲取畫布狀態

## 📁 專案結構

```
snapraze/
├── 📂 components/      # UI組件
│   ├── 📂 ui/         # 基礎UI組件
│   └── 📄 file-uploader  # 文件上傳組件
├── 📂 hooks/          # 自定義Hooks
├── 📂 lib/           # 工具函數
├── 📂 pages/         # 頁面
└── 📂 public/        # 靜態資源
```

## 🚀 開始使用

### 1️⃣ 克隆專案

```bash
git clone https://github.com/SunZhi-Will/snapraze.git
cd snapraze
```
### 2️⃣ 設定環境變數

在專案根目錄建立 `.env` 和 `.env.local` 檔案：

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

請將以上變數替換為您的實際設定值。

### 3️⃣ 設定 Prisma

1. 初始化 Prisma
```bash
npx prisma init
```

2. 執行資料庫遷移
```bash
npx prisma migrate dev
```

3. 生成 Prisma Client
```bash
npx prisma generate
```

### 4️⃣ 安裝依賴

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 5️⃣ 啟動開發服務器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

在瀏覽器中打開 [http://localhost:3000](http://localhost:3000) 查看結果。

## 💻 開發說明

- 在 `pages` 目錄修改頁面
- 支援熱重載
- 使用 `components` 目錄的組件
- 在 `hooks` 目錄建立自定義hooks

## 🌐 部署

使用 [Vercel平台](https://vercel.com/new) 部署：

1. 推送代碼到GitHub
2. 在Vercel導入專案
3. 完成部署

## 🤝 參與貢獻

歡迎提交貢獻！

1. Fork 本專案
2. 建立功能分支
3. 提交更改
4. 推送分支
5. 建立Pull Request

## 📄 授權

本專案使用 [MIT License](LICENSE) 授權。

---

<div align="center">

Made with ❤️ by [SunZhi-Will](https://github.com/SunZhi-Will)

</div>


