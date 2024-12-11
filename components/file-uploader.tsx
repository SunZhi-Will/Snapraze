"use client"
import React, { useState, useCallback } from 'react';
import { UploadCloud, FileImage, X, Loader2 } from 'lucide-react';

const FileUploader = () => {
    const [isDragActive, setIsDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

    // Handle file drag events
    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    // Handle file drop
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            handleFileSelection(droppedFiles[0]);
        }
    }, []);

    // Handle file input change
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            handleFileSelection(selectedFiles[0]);
        }
    };

    // Common file selection logic
    const handleFileSelection = (selectedFile: File) => {
        // Check file type and size
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(selectedFile.type)) {
            alert('只允許上傳圖片檔案 (JPEG, PNG, GIF, WEBP)');
            return;
        }

        if (selectedFile.size > maxSize) {
            alert('檔案大小不能超過 5MB');
            return;
        }

        setFile(selectedFile);
        setUploadStatus('idle');
    };

    // Upload file to server
    const uploadFile = async () => {
        if (!file) return;

        setUploadStatus('uploading');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('上傳失敗');
            }

            const result = await response.json();
            setUploadedImageUrl(result.imageUrl);
            setUploadStatus('success');
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');
            alert('上傳失敗，請稍後再試');
        }
    };

    // Reset uploaded state
    const resetUpload = () => {
        setFile(null);
        setUploadStatus('idle');
        setUploadedImageUrl(null);
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}
        `}
            >
                {!file && (
                    <>
                        <UploadCloud className="mx-auto mb-4 text-gray-400" size={48} />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="fileUpload"
                            onChange={handleFileInput}
                        />
                        <label
                            htmlFor="fileUpload"
                            className="cursor-pointer text-blue-500 hover:underline"
                        >
                            拖曳檔案至此處或點擊選擇檔案
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                            支援 JPEG, PNG, GIF, WEBP (最大 5MB)
                        </p>
                    </>
                )}

                {file && (
                    <div className="flex flex-col items-center">
                        <div className="flex items-center mb-4">
                            <FileImage className="mr-2 text-blue-500" />
                            <span>{file.name}</span>
                            <button
                                onClick={resetUpload}
                                className="ml-2 text-red-500 hover:text-red-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <button
                            onClick={uploadFile}
                            disabled={uploadStatus === 'uploading'}
                            className={`
                px-4 py-2 rounded 
                ${uploadStatus === 'uploading'
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'}
              `}
                        >
                            {uploadStatus === 'uploading' ? (
                                <div className="flex items-center">
                                    <Loader2 className="mr-2 animate-spin" size={20} />
                                    上傳中...
                                </div>
                            ) : (
                                '開始上傳'
                            )}
                        </button>
                    </div>
                )}
            </div>

            {uploadStatus === 'success' && uploadedImageUrl && (
                <div className="mt-4 text-center">
                    <p className="text-green-600 mb-2">上傳成功！</p>
                    <img
                        src={uploadedImageUrl}
                        alt="上傳的圖片"
                        className="mx-auto max-w-full rounded-lg shadow-md"
                    />
                    <button
                        onClick={resetUpload}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        重新上傳
                    </button>
                </div>
            )}

            {uploadStatus === 'error' && (
                <div className="mt-4 text-center text-red-500">
                    上傳失敗，請稍後再試
                </div>
            )}
        </div>
    );
};

export default FileUploader;