import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

export const useImageDelete = () => {
    const queryClient = useQueryClient()

    return useMutation({
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
        onError: (error: Error) => {
            toast.error(`刪除失敗: ${error.message}`)
        }
    })
} 