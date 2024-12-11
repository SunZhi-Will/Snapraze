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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: '缺少圖片ID' }, { status: 400 });
        }

        // 使用 Promise 包裝的現代化方式調用 Cloudinary API
        const result = await cloudinary.api.resource(id, {
            type: 'upload',
            resource_type: 'image'
        });

        let response: ImageResponse = {
            id: result.public_id,
            url: result.secure_url,
        };

        try {
            const edit = await cloudinary.api.resource(`edit/${id}`, {
                type: 'upload',
                resource_type: 'image'
            });

            response = {
                ...response,
                editId: edit.public_id,
                editUrl: edit.secure_url,
            };
        } catch {
            // 如果找不到編輯版本，靜默失敗，只返回原始圖片
            console.log(`未找到圖片 ${id} 的編輯版本`);
        }

        return NextResponse.json(response);

    } catch (error) {
        // 修正方式 1：使用錯誤訊息
        console.error('獲取圖片時發生錯誤:', error);
        return new Response(JSON.stringify({ error: '獲取圖片失敗' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}