import cloudinary from '@/lib/cloudinary';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

        // 先從資料庫檢查圖片是否存在
        const dbImage = await prisma.image.findUnique({
            where: { id },
            include: {
                canvasState: true
            }
        });

        if (!dbImage) {
            return NextResponse.json(
                { error: '資料庫中找不到指定的圖片' },
                { status: 404, headers }
            );
        }

        // 從 Cloudinary 獲取圖片資訊
        const result = await cloudinary.api.resource(`uploads/${id}`, {
            type: 'upload',
            resource_type: 'image',
            timestamp: Math.round(new Date().getTime() / 1000)
        });

        let response: ImageResponse = {
            id: result.public_id,
            url: result.secure_url,
        };

        return NextResponse.json({
            ...response,
            hasEditedVersion: dbImage.canvasState !== null
        }, { headers });

    } catch (error) {
        if ((error as CloudinaryError).http_code === 404) {
            return NextResponse.json(
                { error: 'Cloudinary 中找不到指定的圖片' },
                { status: 404 }
            );
        }

        console.error('獲取圖片時發生錯誤:', error);
        return NextResponse.json(
            { error: '獲取圖片失敗' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}