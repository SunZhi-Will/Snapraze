"use client"
import React, { useState, useCallback, useRef } from 'react';
import {
  UploadCloud,
  ImageIcon,
  Plus,
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useQuery } from '@tanstack/react-query'
import { useImageUpload } from '../hooks/useImageUpload'
import { useImageDelete } from '../hooks/useImageDelete'
import { ImageCard } from '../components/image-card'

export const fetchCache = 'force-no-store'

type ImageItem = {
  id: string;
  url: string;
  uploadedAt: Date;
  hasEditedVersion: boolean;
};

const ImageGallery = () => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 獲取圖片列表
  const { data: images = [], isLoading } = useQuery({
    queryKey: ['images'],
    queryFn: async () => {
      const response = await fetch('/api/getImages', {
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('獲取圖片失敗')
      const data = await response.json()
      return data.images
    }
  })

  const uploadMutation = useImageUpload()
  const deleteMutation = useImageDelete()

  // 處理文件上傳
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadMutation.mutate(e.target.files)
    }
  }

  // 處理拖放上傳
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer?.files) {
      uploadMutation.mutate(e.dataTransfer.files)
    }
  }, [uploadMutation])

  // 拖放事件處理
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 添加導航到編輯頁面的處理函數
  const handleImageClick = (imageId: string) => {
    // 移除 'uploads/' 前綴
    const cleanImageId = imageId.replace('uploads/', '');
    router.push(`/edit/${cleanImageId}`);
  };

  // 優化圖片網格渲染邏輯
  const renderImageGrid = () => {
    if (isLoading) {
      return (
        <div className="col-span-full min-h-[200px] flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500" />
          <p className="mt-4 text-gray-500 text-sm sm:text-base">載入中...</p>
        </div>
      )
    }

    if (images.length === 0) {
      return (
        <div className="col-span-full min-h-[200px] flex flex-col items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-4">
          <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm sm:text-base text-center">尚未上傳任何圖片</p>
        </div>
      )
    }

    return images.map((image: ImageItem) => (
      <ImageCard
        key={image.id}
        image={image}
        onDelete={() => deleteMutation.mutate(image.id)}
        onClick={() => handleImageClick(image.id)}
      />
    ))
  }

  return (
    <>
      <AppSidebar />
      <main className="h-full w-full">
        <SidebarTrigger />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <div
          className="mx-auto p-3 sm:p-6 bg-gray-50 h-[calc(100vh-29px)] w-full"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* 上传区域 */}
          <div
            className={`
          fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4
          ${dragActive ? 'visible' : 'invisible'}
        `}
          >
            <div
              className={`
            w-full max-w-sm sm:w-96 h-48 sm:h-64 border-2 border-dashed rounded-lg 
            flex flex-col items-center justify-center
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          `}
            >
              <UploadCloud className="text-blue-500 w-12 h-12 sm:w-16 sm:h-16" />
              <p className="mt-4 text-blue-500 text-sm sm:text-base">
                將圖片拖曳至此上傳
              </p>
            </div>
          </div>

          {/* 標題和上傳按鈕 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
            <h1 className="text-xl sm:text-2xl font-bold">我的圖片</h1>
            <div className="w-full sm:w-auto">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg 
                flex items-center justify-center hover:bg-blue-600 transition"
              >
                <Plus className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                上傳圖片
              </button>
            </div>
          </div>

          {/* 圖片網格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 
            overflow-y-auto max-h-[calc(100%-40px)]">
            {renderImageGrid()}
          </div>
        </div>
      </main>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        className="hidden"
        multiple
        accept="image/*"
      />
    </>
  );
};

export default ImageGallery;
