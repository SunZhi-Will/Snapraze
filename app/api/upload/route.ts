import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// 確保 Prisma 客戶端只被初始化一次
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    if (!(global as any).prisma) {
        (global as any).prisma = new PrismaClient();
    }
    prisma = (global as any).prisma;
}

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult extends Record<string, any> {
    secure_url: string;
    public_id: string;
    original_filename: string;
    bytes: number;
    format: string;
}

export const POST = async (request: Request) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        if (!file.name) {
            return NextResponse.json(
                { error: 'File must have a name' },
                { status: 400 }
            );
        }

        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type' },
                { status: 400 }
            );
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: 'File too large' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const base64File = Buffer.from(bytes).toString('base64');

        const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
            cloudinary.uploader.upload(`data:${file.type};base64,${base64File}`, {
                folder: 'uploads',
                use_filename: true
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result as CloudinaryUploadResult);
            });
        });

        // 從 public_id 中移除 'uploads/' 前綴
        const filename = uploadResult.public_id.replace('uploads/', '');

        // 保存圖片資訊到資料庫
        const image = await prisma.image.create({
            data: {
                id: filename,
                url: uploadResult.secure_url,
                filename: uploadResult.public_id || 'untitled',
                mimeType: file.type,
                size: uploadResult.bytes,
            }
        });

        return NextResponse.json({
            message: 'Upload successful',
            imageUrl: image.url,
            imageId: image.id
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed', details: (error as Error).message },
            { status: 500 }
        );
    } finally {
        // 在開發環境中不需要斷開連接，因為我們重複使用同一個實例
        if (process.env.NODE_ENV === 'production') {
            await prisma.$disconnect();
        }
    }
};
