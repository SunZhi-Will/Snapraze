import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // 執行系統狀態檢查
        const imageCount = await prisma.image.count();

        // 創建新的系統狀態記錄
        const systemStatus = await prisma.systemStatus.create({
            data: {
                status: 'active',
                imageCount: imageCount,
                lastCheck: new Date(),
            }
        });

        // 清理舊記錄（只保留最近24小時的記錄）
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await prisma.systemStatus.deleteMany({
            where: {
                createdAt: {
                    lt: twentyFourHoursAgo
                }
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: '系統狀態已更新',
                timestamp: systemStatus.lastCheck.toISOString(),
                imageCount: imageCount
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Cron job 執行失敗:', error);
        return NextResponse.json(
            { success: false, message: '系統狀態更新失敗' },
            { status: 500 }
        );
    }
}

// 設定 Vercel Cron Job
export const dynamic = 'force-dynamic';
export const runtime = 'edge'; 