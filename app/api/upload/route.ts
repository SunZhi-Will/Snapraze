import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// 配置 Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST = async (request: Request) => {
    try {
        // 获取文件数据
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // 验证文件类型和大小
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const MAX_SIZE = 5 * 1024 * 1024 * 1024; // 5MB

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

        // 转换文件为 Base64
        const bytes = await file.arrayBuffer();
        const base64File = Buffer.from(bytes).toString('base64');

        // 直接上传到 Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(`data:${file.type};base64,${base64File}`, {
                folder: 'uploads',
                use_filename: true
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        // 返回上传结果
        return NextResponse.json({
            message: 'Upload successful',
            imageUrl: (uploadResult as any).secure_url,
            imageId: (uploadResult as any).public_id
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed', details: (error as Error).message },
            { status: 500 }
        );
    }
};

// 配置以支持文件上传
export const config = {
    api: {
        bodyParser: false
    }
};