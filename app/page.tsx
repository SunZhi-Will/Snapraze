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

type ImageItem = {
  id: string;
  url: string;
  uploadedAt: Date;
  hasEditedVersion?: boolean;
  editedUrl?: string | null;
};

const ImageGallery = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/getImages?t=${timestamp}`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('獲取圖片失敗');
        }
        const data = await response.json();
        setImages(data.images);
      } catch (error) {
        toast.error(`載入圖片失敗: ${(error as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

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

  // 文件上传处理
  // 修改上傳文件處理函數
  const uploadFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(file =>
      ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
    );

    if (validFiles.length === 0) {
      toast.error('請選擇有效的圖片文件');
      return;
    }

    // 顯示總體上傳進度提示
    toast.loading(`正在上傳 ${validFiles.length} 個文件...`, {
      id: 'upload-progress'
    });

    try {
      // 使用 Promise.all 同時處理多個文件上傳
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`上傳 ${file.name} 失敗`);
        }

        const result = await response.json();
        return {
          id: result.imageId,
          url: result.imageUrl,
          uploadedAt: new Date()
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      setImages(prev => [...prev, ...uploadedImages]);
      toast.success(`成功上傳 ${validFiles.length} 個文件！`, {
        id: 'upload-progress'
      });
    } catch (error) {
      toast.error(`上傳過程中發生錯誤: ${(error as Error).message}`, {
        id: 'upload-progress'
      });
    }
  };

  // 处理文件拖放
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer?.files) {
      uploadFiles(e.dataTransfer.files);
    }
  }, []);

  // 文件输入change事件
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(e.target.files);
    }
  };

  // 刪除圖片
  const deleteImage = async (id: string) => {
    try {
      toast.loading('正在刪除圖片...', { id: 'delete-progress' });

      const timestamp = new Date().getTime();
      const response = await fetch(`/api/deleteImage?id=${id}&t=${timestamp}`, {
        method: 'DELETE',
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('刪除圖片失敗');
      }

      // 從狀態中移除圖片
      setImages(prev => prev.filter(img => img.id !== id));
      // 不需要重新獲取圖片列表，因為已經從狀態中移除了

      toast.success('圖片已成功刪除', { id: 'delete-progress' });
    } catch (error) {
      toast.error(`刪除圖片失敗: ${(error as Error).message}`, {
        id: 'delete-progress'
      });
    }
  };

  // 添加導航到編輯頁面的處理函數
  const handleImageClick = async (imageId: string) => {
    try {
      // 在導航前先檢查圖片是否存在
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/getImage?id=${imageId}&t=${timestamp}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('圖片不存在或已被刪除');
      }

      const encodedId = imageId.replace(/\//g, '--');
      router.push(`/edit/${encodedId}`);
    } catch (error) {
      toast.error(`無法訪問圖片: ${(error as Error).message}`);
    }
  };

  return (
    <>
      <AppSidebar />
      <main className="h-full w-full ">
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
          className="mx-auto p-3 sm:p-6 bg-gray-50 min-h-screen w-full"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
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
              images.map((image) => (
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
                        deleteImage(image.id);
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
