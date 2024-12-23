import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

type ImageWithCanvasState = {
    id: string;
    url: string;
    createdAt: Date;
    canvasState: { id: string } | null;
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = async () => {
    const headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
    };

    try {
        const dbImages = await prisma.image.findMany({
            include: {
                canvasState: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const images = dbImages.map((image: ImageWithCanvasState) => ({
            id: image.id,
            url: image.url,
            uploadedAt: image.createdAt,
            hasEditedVersion: image.canvasState !== null
        }));

        return NextResponse.json({
            message: '成功獲取圖片列表',
            images
        }, { headers });

    } catch (error) {
        console.error('獲取圖片列表失敗:', error);
        return NextResponse.json(
            { error: '獲取圖片列表失敗', details: (error as Error).message },
            { status: 500 }
        );
    }
};
