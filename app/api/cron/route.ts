import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // 執行系統狀態檢查
        const imageCount = await prisma.image.count();
        console.log(`當前圖片數量: ${imageCount}`);

        // 創建新的系統狀態記錄
        const systemStatus = await prisma.systemStatus.create({
            data: {
                status: 'active',
                imageCount: imageCount,
                lastCheck: new Date(),
            }
        });
        console.log(`系統狀態記錄已創建: ${JSON.stringify(systemStatus)}`);

        // 清理舊記錄（只保留最近24小時的記錄）
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const deleteResult = await prisma.systemStatus.deleteMany({
            where: {
                createdAt: {
                    lt: twentyFourHoursAgo
                }
            }
        });
        console.log(`已清理 ${deleteResult.count} 條舊記錄`);

        // 驗證記錄是否真的被創建
        const verifyStatus = await prisma.systemStatus.findUnique({
            where: { id: systemStatus.id }
        });

        if (!verifyStatus) {
            throw new Error('系統狀態記錄創建失敗：無法驗證記錄');
        }

        return NextResponse.json(
            {
                success: true,
                message: '系統狀態已更新',
                timestamp: systemStatus.lastCheck.toISOString(),
                imageCount: imageCount,
                systemStatusId: systemStatus.id
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Cron job 執行失敗:', error);
        return NextResponse.json(
            {
                success: false,
                message: '系統狀態更新失敗',
                error: error instanceof Error ? error.message : '未知錯誤'
            },
            { status: 500 }
        );
    }
}

// 設定 Vercel Cron Job
export const dynamic = 'force-dynamic'; 