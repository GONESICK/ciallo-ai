export default function dotLoading({ label }: { label?: string }) {
    return (
        <div className="flex items-center gap-1 h-8">
            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            <span className="text-gray-400 text-sm ml-2">{label}</span>
        </div>
    );
}
