import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// 配置 Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryResource {
    public_id: string;
    secure_url: string;
    created_at: string;
}

interface CloudinaryResponse {
    resources: CloudinaryResource[];
}

export const GET = async () => {
    try {
        // 獲取原始圖片
        const originalImages = await new Promise((resolve, reject) => {
            cloudinary.api.resources(
                {
                    type: 'upload',
                    prefix: 'uploads/',
                    max_results: 100
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
        });

        // 獲取編輯過的圖片
        const editedImages = await new Promise((resolve, reject) => {
            cloudinary.api.resources(
                {
                    type: 'upload',
                    prefix: 'edit/',
                    max_results: 100
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
        });

        // 格式化返回數據，並檢查是否有對應的編輯版本
        const images = (originalImages as CloudinaryResponse).resources.map((resource: CloudinaryResource) => {
            const baseId = resource.public_id.replace('uploads/', '');
            const editedVersion = (editedImages as CloudinaryResponse).resources.find(
                (edited: CloudinaryResource) => edited.public_id === `edit/uploads/${baseId}`
            );

            return {
                id: resource.public_id,
                url: resource.secure_url,
                uploadedAt: new Date(resource.created_at),
                hasEditedVersion: !!editedVersion,
                editedUrl: editedVersion ? editedVersion.secure_url : null
            };
        });

        return NextResponse.json({
            message: '成功獲取圖片列表',
            images
        });

    } catch (error) {
        console.error('獲取圖片列表失敗:', error);
        return NextResponse.json(
            { error: '獲取圖片列表失敗', details: (error as Error).message },
            { status: 500 }
        );
    }
};
