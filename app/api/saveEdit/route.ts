import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { id, canvasData, displayDimensions } = await request.json();

        // 確保圖片存在
        const image = await prisma.image.findUnique({
            where: { id }
        });

        if (!image) {
            return NextResponse.json(
                { error: '找不到對應的圖片' },
                { status: 404 }
            );
        }

        await prisma.canvasState.upsert({
            where: { imageId: id },
            update: {
                canvasData,
                displayDimensions
            },
            create: {
                imageId: id,
                canvasData,
                displayDimensions
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('保存編輯狀態失敗:', error);
        return NextResponse.json(
            { error: '保存失敗' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
