"use client"
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric'; // v6
import {
    Type,
    Pencil,
    Save,
    Undo,
    Redo,
    ArrowLeft,
    Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { useQuery, useMutation } from '@tanstack/react-query';

interface CanvasJSON {
    backgroundImage?: {
        crossOrigin: string;
        src: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

interface CanvasState {
    canvasData: fabric.CanvasOptions;
    displayDimensions?: {
        width: number;
        height: number;
    };
}

export const fetchCache = 'force-no-store'

export default function EditPage({ params }: { params: { id: string } }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [isHistoryAction, setIsHistoryAction] = useState<boolean>(false);
    const [originalUrl, setOriginalUrl] = useState<string>('');
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [showOriginal, setShowOriginal] = useState<boolean>(false);
    const [showComparison, setShowComparison] = useState<boolean>(false);
    const [editedImageUrl, setEditedImageUrl] = useState<string>('');
    const [currentCanvasState, setCurrentCanvasState] = useState<fabric.CanvasOptions>();
    const router = useRouter();

    const { data } = useQuery({
        queryKey: ['image', params.id],
        queryFn: async () => {
            const imageId = params.id.replace(/--/g, '/');
            const [imageResponse, stateResponse] = await Promise.all([
                fetch(`/api/getImage?id=${imageId}`),
                fetch(`/api/getCanvasState?id=${params.id}`)
            ]);

            const imageData = await imageResponse.json();
            const stateData = await stateResponse.json();

            return {
                imageUrl: imageData.url,
                canvasState: stateResponse.ok ? stateData : null
            };
        }
    });

    const saveMutation = useMutation({
        mutationFn: async (canvasData: { json: fabric.CanvasOptions, dimensions: { width: number, height: number } }) => {
            const response = await fetch('/api/saveEdit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: params.id,
                    canvasData: canvasData.json,
                    displayDimensions: canvasData.dimensions
                }),
            });
            if (!response.ok) throw new Error('儲存失敗');
            return response.json();
        },
        onSuccess: () => {
            toast.success('儲存成功');
        },
        onError: () => {
            toast.error('儲存失敗');
        }
    });

    useEffect(() => {
        if (data) {
            setOriginalUrl(data.imageUrl);
            setIsEdit(!!data.canvasState);

            setTimeout(() => {
                initCanvas(data.imageUrl, data.canvasState);
            }, 0);
        }
    }, [data]);

    const initCanvas = async (url: string, stateData: CanvasState | null) => {
        if (!canvasRef.current) return;

        // 確保在初始化新的 Canvas 前，先清理現有的 Canvas
        if (fabricCanvasRef.current) {
            fabricCanvasRef.current.dispose();
            fabricCanvasRef.current = null;
            setCanvas(null);
        }

        // 確保 DOM 元素已重置
        const existingCanvas = canvasRef.current;
        const newCanvasElement = document.createElement('canvas');
        existingCanvas.parentNode?.replaceChild(newCanvasElement, existingCanvas);
        // 使用 MutableRefObject 來允許修改 current 屬性
        (canvasRef as React.MutableRefObject<HTMLCanvasElement>).current = newCanvasElement;

        // 等待一小段時間確保 DOM 完全更新
        await new Promise(resolve => setTimeout(resolve, 0));

        try {
            const loadImage = () => {
                return new Promise<HTMLImageElement>((resolve) => {
                    const img = document.createElement('img');
                    img.crossOrigin = 'anonymous';
                    img.onload = () => resolve(img);
                    img.src = url;
                });
            };

            const img = await loadImage();
            const originalWidth = img.width;
            const originalHeight = img.height;

            // 計算顯示尺寸
            const maxWidth = window.innerWidth * 0.8;
            const maxHeight = window.innerHeight * 0.8;

            let displayWidth = originalWidth;
            let displayHeight = originalHeight;

            // 等比例縮放顯示尺寸
            if (displayWidth > maxWidth) {
                const ratio = maxWidth / displayWidth;
                displayWidth = maxWidth;
                displayHeight = displayHeight * ratio;
            }

            if (displayHeight > maxHeight) {
                const ratio = maxHeight / displayHeight;
                displayHeight = maxHeight;
                displayWidth = displayWidth * ratio;
            }

            // 創建畫布並設置為與圖片相同的尺寸
            const newCanvas = new fabric.Canvas(canvasRef.current, {
                width: displayWidth,
                height: displayHeight,
                backgroundColor: 'transparent', // 設置透明背景
            });

            fabricCanvasRef.current = newCanvas;

            // 將圖片作為背景，並確保它完全覆蓋畫布
            const fabricImage = new fabric.Image(img);
            fabricImage.scaleToWidth(displayWidth);
            fabricImage.scaleToHeight(displayHeight);
            newCanvas.backgroundImage = fabricImage;
            newCanvas.renderAll();

            setCanvas(newCanvas);

            // 初始化時保存第一個歷史記錄
            setTimeout(() => {
                const initialJson = JSON.stringify((newCanvas as fabric.Canvas).toJSON());
                setHistory([initialJson]);
                setHistoryIndex(0);
            }, 100);

            // 修改載入已保存狀態的部分
            if (stateData) {
                const { canvasData, displayDimensions } = stateData;
                if (canvasData) {
                    // 如果有已保存的狀態，載入它
                    newCanvas.loadFromJSON(canvasData).then(() => {
                        newCanvas.renderAll();
                        // 設置保存的顯示尺寸
                        if (displayDimensions) {
                            newCanvas.setDimensions(displayDimensions);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Canvas 初始化錯誤:', error);
            // toast.error('畫布初始化失敗');
        }
    };

    const addText = () => {
        if (!canvas) return;
        if (isDrawing) {
            setIsDrawing(false);
            canvas.isDrawingMode = false;
        }
        const text = new fabric.IText('請輸入文字', {
            left: 100,
            top: 100,
            fontSize: 20,
            fill: '#000000',
            editable: true,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        saveToHistory();
    };

    const enableDrawing = () => {
        if (!canvas) return;
        const newDrawingMode = !canvas.isDrawingMode;
        canvas.isDrawingMode = newDrawingMode;
        setIsDrawing(newDrawingMode);

        if (newDrawingMode) {
            if (!canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            }
            canvas.freeDrawingBrush.width = 2;
            canvas.freeDrawingBrush.color = '#000000';
        }
    };

    const saveCanvas = async () => {
        if (!canvas) return;

        const canvasJSON = canvas.toJSON();
        saveMutation.mutate({
            json: canvasJSON,
            dimensions: {
                width: canvas.getWidth(),
                height: canvas.getHeight()
            }
        });
    };

    const saveToHistory = useCallback(() => {
        if (!canvas) return;
        try {
            let json = JSON.stringify((canvas as fabric.Canvas).toJSON());
            if (!json) return;

            const jsonObj = JSON.parse(json) as CanvasJSON;
            if (!jsonObj.backgroundImage) {
                console.warn('背景圖片失，重新加入');
                if (canvas.backgroundImage) {
                    const bgImage = canvas.backgroundImage as fabric.Image;
                    jsonObj.backgroundImage = {
                        ...bgImage.toObject(),
                        crossOrigin: 'anonymous',
                        src: originalUrl
                    };
                    json = JSON.stringify(jsonObj);
                }
            }

            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(json);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        } catch (error) {
            console.error('保存歷史記錄失敗:', error);
            toast.error('保存歷史記錄失敗');
        }
    }, [canvas, history, historyIndex, originalUrl]);

    const undo = useCallback(() => {
        if (!canvas || historyIndex <= 0) return;
        setIsHistoryAction(true);
        try {
            const newIndex = historyIndex - 1;
            const json = history[newIndex];
            if (!json) {
                throw new Error('歷史記錄無效');
            }

            (canvas as fabric.Canvas).loadFromJSON(json).then(function () {
                // 確保背景圖片正確載入
                if (canvas.backgroundImage) {
                    const bgImage = canvas.backgroundImage as fabric.Image;
                    bgImage.set('crossOrigin', 'anonymous');
                    bgImage.setSrc(originalUrl, { crossOrigin: 'anonymous' });
                }
                canvas.renderAll();
                setHistoryIndex(newIndex);
                // 在所有操作完成後才重置 isHistoryAction
                setTimeout(() => {
                    setIsHistoryAction(false);
                }, 100);
            })
        } catch (error) {
            console.error('復原操作失敗:', error);
            toast.error('復原失敗');
            setIsHistoryAction(false);
        }
    }, [canvas, historyIndex, history, originalUrl]);

    const redo = useCallback(() => {
        if (!canvas || historyIndex >= history.length - 1) return;
        setIsHistoryAction(true);
        const newIndex = historyIndex + 1;
        try {
            (canvas as fabric.Canvas).loadFromJSON(history[newIndex]).then(function () {
                if (canvas.backgroundImage) {
                    const bgImage = canvas.backgroundImage as fabric.Image;
                    bgImage.set('crossOrigin', 'anonymous');
                    bgImage.setSrc(originalUrl, { crossOrigin: 'anonymous' });
                }
                canvas.renderAll();
                setHistoryIndex(newIndex);
                setTimeout(() => {
                    setIsHistoryAction(false);
                }, 100);
            })
        } catch {
            setIsHistoryAction(false);
        }
    }, [canvas, historyIndex, history, originalUrl]);

    const deleteSelected = useCallback(() => {
        if (!canvas) return;
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
            activeObjects.forEach((obj) => {
                canvas.remove(obj);
            });
            canvas.discardActiveObject();
            canvas.renderAll();
            saveToHistory();
        }
    }, [canvas, saveToHistory]);

    useEffect(() => {
        if (!canvas) return;

        const handleModification = () => {
            if (!isHistoryAction) {
                console.log('saveToHistory');
                saveToHistory();
            }
        };

        canvas.on('object:added', handleModification);
        canvas.on('object:modified', handleModification);
        canvas.on('object:removed', handleModification);

        return () => {
            canvas.off('object:added', handleModification);
            canvas.off('object:modified', handleModification);
            canvas.off('object:removed', handleModification);
        };
    }, [canvas, historyIndex, isHistoryAction, saveToHistory]);

    useEffect(() => {
        const handleKeyboard = (e: KeyboardEvent) => {
            if (!canvas) return;

            // 處理 Ctrl+Z 和 Ctrl+Y
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                redo();
            }

            // 處理 Delete 和 Backspace 鍵
            // 檢查是否正在編輯文字
            const activeObject = canvas.getActiveObject();
            const isEditingText = activeObject && activeObject.type === 'i-text' && (activeObject as fabric.IText).isEditing;

            if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditingText) {
                e.preventDefault();
                deleteSelected();
            }
        };

        window.addEventListener('keydown', handleKeyboard);
        return () => window.removeEventListener('keydown', handleKeyboard);
    }, [canvas, undo, redo, deleteSelected]);

    const toggleOriginal = async () => {
        if (!showOriginal && canvas) {
            // 切換到原圖之前，保存當前的編輯狀態
            const canvasState = canvas.toJSON();
            setCurrentCanvasState(canvasState);
        }

        if (fabricCanvasRef.current) {
            try {
                fabricCanvasRef.current.dispose();
            } catch (error) {
                console.error('清理 canvas 錯誤:', error);
            }
            fabricCanvasRef.current = null;
            setCanvas(null);
        }

        setShowOriginal(!showOriginal);

        // 如果從原圖切換回編輯視圖，使用保存的狀態
        if (showOriginal && currentCanvasState) {
            setTimeout(() => {
                initCanvas(originalUrl, { canvasData: currentCanvasState });
            }, 100);
        }
    };

    const toggleComparison = async () => {
        if (!showComparison && canvas) {
            // 切換到比較模式時，保存當前的編輯狀態和預覽圖
            const canvasState = canvas.toJSON();
            setCurrentCanvasState(canvasState);

            const dataURL = canvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: 1
            });
            setEditedImageUrl(dataURL);
        }

        if (fabricCanvasRef.current) {
            try {
                fabricCanvasRef.current.dispose();
            } catch (error) {
                console.error('清理 canvas 錯誤:', error);
            }
            fabricCanvasRef.current = null;
            setCanvas(null);
        }

        setShowComparison(!showComparison);

        // 如果從比較視圖切換回編輯視圖，使用保存的狀態
        if (showComparison && currentCanvasState) {
            setTimeout(() => {
                initCanvas(originalUrl, { canvasData: currentCanvasState });
            }, 100);
        }
    };

    useEffect(() => {
        // 組件卸載時清理 Canvas
        return () => {
            if (fabricCanvasRef.current) {
                fabricCanvasRef.current.dispose();
                fabricCanvasRef.current = null;
                setCanvas(null);
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <Toaster />

            {/* 工具列 */}
            <div className="fixed top-4 left-4 right-4 bg-white rounded-lg shadow-lg p-2 sm:p-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeft />
                    </button>

                    {isEdit && (
                        <>
                            <div className="hidden sm:block h-6 w-px bg-gray-300" />
                            {!showComparison && (
                                <button
                                    onClick={toggleOriginal}
                                    className={`px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base rounded-lg ${showOriginal ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    {showOriginal ? '編輯圖' : '原圖'}
                                </button>
                            )}

                            <button
                                onClick={toggleComparison}
                                className={`px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base rounded-lg ${showComparison ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                                    }`}
                            >
                                {showComparison ? '返回編輯' : '比較'}
                            </button>
                        </>
                    )}

                    {!showComparison && (
                        <>
                            <div className="hidden sm:block h-6 w-px bg-gray-300" />
                            <button onClick={addText} className="p-2 hover:bg-gray-100 rounded-lg" title="添加文字">
                                <Type />
                            </button>
                            <button
                                onClick={enableDrawing}
                                className={`p-2 hover:bg-gray-100 rounded-lg ${isDrawing ? 'bg-blue-100 text-blue-600' : ''
                                    }`}
                                title="繪製"
                            >
                                <Pencil />
                            </button>
                            <button
                                onClick={saveCanvas}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                title="儲存"
                            >
                                <Save />
                            </button>
                            <button
                                onClick={undo}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                title="復原"
                            >
                                <Undo />
                            </button>
                            <button
                                onClick={redo}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                title="重做"
                            >
                                <Redo />
                            </button>
                            <button
                                onClick={deleteSelected}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                title="刪除"
                            >
                                <Trash2 />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* 畫布容器 */}
            <div className="mt-24 sm:mt-20">
                {showComparison ? (
                    <div className="flex flex-col sm:flex-row justify-center sm:space-x-4 space-y-4 sm:space-y-0">
                        <div className="relative">
                            <Image
                                src={originalUrl}
                                alt="原圖"
                                width={800}
                                height={600}
                                className="max-w-full sm:max-h-[80vh] object-contain"
                            />
                            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                                原圖
                            </div>
                        </div>
                        <div className="relative">
                            <Image
                                src={editedImageUrl || originalUrl}
                                alt="編輯圖"
                                width={800}
                                height={600}
                                className="max-w-full sm:max-h-[80vh] object-contain"
                            />
                            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                                編輯圖
                            </div>
                        </div>
                    </div>
                ) : showOriginal ? (
                    <div className="flex justify-center px-2 sm:px-4">
                        <div className="relative">
                            <Image
                                src={originalUrl}
                                alt="原圖"
                                width={800}
                                height={600}
                                className="max-w-full sm:max-h-[80vh] object-contain"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center px-2 sm:px-4">
                        <div id="canvas-container">
                            <canvas ref={canvasRef} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
