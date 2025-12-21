export function ChatListSkeleton() {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            {/* Header Skeleton */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-4 animate-pulse"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* List Skeleton */}
            <div className="flex-1 overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 border-b border-gray-200 dark:border-gray-700 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ChatMessagesSkeleton() {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800">
            {/* Header Skeleton */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Messages Skeleton */}
            <div className="flex-1 p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                        <div className={`flex flex-col ${i % 2 === 0 ? 'items-end' : 'items-start'}`}>
                            <div className={`h-16 ${i % 2 === 0 ? 'bg-primary/20' : 'bg-gray-200 dark:bg-gray-700'} rounded-2xl w-48 animate-pulse`}></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-1 animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Skeleton */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex gap-2">
                    <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-10 w-20 bg-primary/20 rounded animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}
