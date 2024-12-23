"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  UploadCloud,
  ImageIcon,
  Trash2,
  Plus,
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const fetchCache = 'force-no-store'

type ImageItem = {
  id: string;
  url: string;
  uploadedAt: Date;
  hasEditedVersion: boolean;
};

const ImageGallery = () => {
  const queryClient = useQueryClient()
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

  // 上傳圖片
  const uploadMutation = useMutation({
    mutationFn: async (files: FileList | File[]) => {
      const validFiles = Array.from(files).filter(file =>
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
      )

      if (validFiles.length === 0) {
        throw new Error('請選擇有效的圖片文件')
      }

      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) throw new Error(`上傳 ${file.name} 失敗`)
        return response.json()
      })

      return Promise.all(uploadPromises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] })
      toast.success('上傳成功')
    },
    onError: (error) => {
      toast.error(`上傳失敗: ${error.message}`)
    }
  })

  // 刪除圖片
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/deleteImage?id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('刪除圖片失敗')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] })
      toast.success('刪除成功')
    },
    onError: (error) => {
      toast.error(`刪除失敗: ${error.message}`)
    }
  })

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
            {isLoading ? (
              <div className="col-span-full min-h-[200px] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500" />
                <p className="mt-4 text-gray-500 text-sm sm:text-base">載入中...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="col-span-full min-h-[200px] flex flex-col items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-4">
                <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm sm:text-base text-center">尚未上傳任何圖片</p>
              </div>
            ) : (
              images.map((image: ImageItem) => (
                <div
                  key={image.id}
                  className="relative group cursor-pointer aspect-square"
                >
                  <Image
                    src={image.url}
                    alt="Uploaded"
                    fill
                    className="object-cover rounded-lg"
                    onClick={() => handleImageClick(image.id)}
                  />
                  <div className="absolute top-2 right-2 flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(image.id);
                      }}
                      className="bg-white/80 p-1.5 sm:p-2 rounded-full 
                      opacity-0 group-hover:opacity-100 transition hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  {image.hasEditedVersion && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/80 px-2 py-1 rounded-full text-xs text-blue-600">
                      已編輯
                    </div>
                  )}
                </div>
              ))
            )}
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
