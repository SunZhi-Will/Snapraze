import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// 配置 Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface ImageResponse {
    id: string;
    url: string;
    editId?: string;
    editUrl?: string;
}

interface CloudinaryError {
    http_code?: number;
    message?: string;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    try {
        // 添加緩存控制標頭
        const headers = {
            'Cache-Control': 'no-cache, no-store, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
        };
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');



        if (!id) {
            return NextResponse.json({ error: '缺少圖片ID' }, {
                status: 400,
                headers
            });
        }

        // 添加時間戳參數
        const result = await cloudinary.api.resource(id, {
            type: 'upload',
            resource_type: 'image',
            timestamp: Math.round(new Date().getTime() / 1000)
        });

        let response: ImageResponse = {
            id: result.public_id,
            url: result.secure_url,
        };

        try {
            // 編輯版本也添加時間戳參數
            const edit = await cloudinary.api.resource(`edit/${id}`, {
                type: 'upload',
                resource_type: 'image',
                timestamp: Math.round(new Date().getTime() / 1000)
            });

            response = {
                ...response,
                editId: edit.public_id,
                editUrl: edit.secure_url,
            };
        } catch {
            console.log(`未找到圖片 ${id} 的編輯版本`);
        }

        return NextResponse.json(response, { headers });

    } catch (error) {
        if ((error as CloudinaryError).http_code === 404) {
            return NextResponse.json(
                { error: '找不到指定的圖片' },
                { status: 404 }
            );
        }

        console.error('獲取圖片時發生錯誤:', error);
        return NextResponse.json(
            { error: '獲取圖片失敗' },
            { status: 500 }
        );
    }
}