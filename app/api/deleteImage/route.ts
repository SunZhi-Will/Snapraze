import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// 配置 Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const DELETE = async (request: Request) => {
    try {
        // 從 URL 獲取圖片 ID
        const { searchParams } = new URL(request.url);
        const imageId = searchParams.get('id');

        if (!imageId) {
            return NextResponse.json(
                { error: '缺少圖片 ID' },
                { status: 400 }
            );
        }

        // 檢查是否存在編輯過的圖片（通常會加上 'edited_' 前綴）
        const editedImageId = `edit/${imageId}`;

        // 先嘗試刪除編輯過的圖片（如果存在）
        try {
            await new Promise((resolve, reject) => {
                cloudinary.uploader.destroy(editedImageId, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
            });
        } catch (error) {
            // 如果編輯圖片不存在或刪除失敗，繼續執行（不中斷流程）
            console.log('編輯圖片不存在或刪除失敗:', error);
        }

        // 刪除原始圖片
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(imageId, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        return NextResponse.json({
            message: '圖片刪除成功',
            result
        });

    } catch (error) {
        console.error('刪除圖片失敗:', error);
        return NextResponse.json(
            { error: '刪除圖片失敗', details: (error as Error).message },
            { status: 500 }
        );
    }
};
