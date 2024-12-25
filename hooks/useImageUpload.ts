import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

export const useImageUpload = () => {
    const queryClient = useQueryClient()

    return useMutation({
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
        onError: (error: Error) => {
            toast.error(`上傳失敗: ${error.message}`)
        }
    })
} 