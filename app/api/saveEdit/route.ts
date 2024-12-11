import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// 配置 Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        const { id, imageData } = await request.json();

        // 將 base64 圖片數據處理
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');

        // 生成新的檔案名稱
        const originalPath = id.replace(/--/g, '/');
        const editPath = originalPath;

        // 上傳到 Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(`data:image/png;base64,${base64Data}`, {
                folder: 'edit',
                public_id: editPath,
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        return NextResponse.json({
            success: true,
            url: (uploadResult as any).secure_url
        });

    } catch (error) {
        console.error('儲存編輯圖片錯誤:', error);
        return NextResponse.json(
            { error: '儲存圖片時發生錯誤' },
            { status: 500 }
        );
    }
}
