import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { ImageItem } from '../app/types'

interface ImageCardProps {
    image: ImageItem
    onDelete: () => void
    onClick: () => void
}

export const ImageCard = ({ image, onDelete, onClick }: ImageCardProps) => {
    return (
        <div className="relative group cursor-pointer aspect-square">
            <Image
                src={image.url}
                alt="Uploaded"
                fill
                className="object-cover rounded-lg"
                onClick={onClick}
            />
            <div className="absolute top-2 right-2 flex items-center space-x-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onDelete()
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
    )
} 