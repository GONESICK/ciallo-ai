import { useRef } from 'react';

type MediaItem = {
    type: 'image';
    url: string;
};

export default function MediaSelector({
    onSelect,
}: {
    onSelect: (media: MediaItem[]) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const filesLength = files.length;
        const mediaItems: MediaItem[] = [];
        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Url = event.target?.result as string;
                mediaItems.push({
                    type: 'image',
                    url: base64Url,
                });
                // When all files are processed, call onSelect
                if (mediaItems.length === filesLength) {
                    onSelect(mediaItems);
                    // Reset input to allow selecting the same file again
                    e.target.value = '';
                }
            };
            reader.readAsDataURL(file);
        });
    };

    return (
        <div>
            <input
                name="media-selector"
                type="file"
                ref={inputRef}
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleChange}
            />

            <button
                onClick={handleClick}
                className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors flex-shrink-0"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                </svg>
            </button>
        </div>
    );
}
