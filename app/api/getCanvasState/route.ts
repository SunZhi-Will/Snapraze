import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            throw new Error('缺少 ID 參數');
        }

        const state = await prisma.canvasState.findUnique({
            where: { imageId: id },
            include: {
                image: true // 包含關聯的圖片資訊
            }
        });

        if (!state) {
            return NextResponse.json(null);
        }

        return NextResponse.json(state);
    } catch (error) {
        console.error('讀取編輯狀態失敗:', error);
        return NextResponse.json(
            { error: '讀取失敗' },
            { status: 404 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 