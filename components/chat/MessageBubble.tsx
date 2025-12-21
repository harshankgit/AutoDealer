import { Message } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Car, MapPin, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface MessageBubbleProps {
    message: Message;
    isOwnMessage: boolean;
    senderName?: string;
    senderAvatar?: string;
}

export function MessageBubble({ message, isOwnMessage, senderName, senderAvatar }: MessageBubbleProps) {
    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderCarDetails = () => {
        if (message.message_type !== 'car_details' || !message.car_details) return null;

        const car = message.car_details;
        return (
            <Link href={`/cars/${car.id}`}>
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border-2 border-blue-100 dark:border-blue-900 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-xl cursor-pointer max-w-sm group">
                    <div className="flex gap-4">
                        {car.images && car.images[0] && (
                            <div className="relative flex-shrink-0 overflow-hidden rounded-lg shadow-md">
                                <img
                                    src={car.images[0]}
                                    alt={car.title}
                                    className="w-24 h-24 object-cover transform group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {car.title}
                                </h4>
                                <Car className="h-5 w-5 text-blue-500 flex-shrink-0 ml-2 group-hover:scale-110 transition-transform" />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{car.year} • {car.brand} {car.model}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                                        ₹{car.price?.toLocaleString()}
                                    </span>
                                </div>

                            </div>

                            <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-semibold group-hover:underline flex items-center gap-1">
                                View Details
                                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div
            className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} mb-4 animate-slideIn`}
        >
            <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-white dark:ring-gray-800 shadow-sm">
                <AvatarImage src={senderAvatar} alt={senderName} />
                <AvatarFallback className={isOwnMessage ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold' : 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 font-semibold'}>
                    {senderName?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
            </Avatar>

            <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[75%] sm:max-w-md lg:max-w-lg`}>
                {!isOwnMessage && senderName && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1 font-medium">
                        {senderName}
                    </span>
                )}

                <div
                    className={`rounded-2xl px-4 py-2.5 shadow-md transition-all duration-200 hover:shadow-lg ${isOwnMessage
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-sm border border-gray-200 dark:border-gray-700'
                        }`}
                >
                    {message.message_type === 'car_details' ? (
                        renderCarDetails()
                    ) : (
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.message}</p>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-1 px-1">
                    <span className={`text-xs ${isOwnMessage ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {formatTime(message.timestamp)}
                    </span>
                    {isOwnMessage && message.is_read && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 animate-fadeIn font-bold">✓✓</span>
                    )}
                </div>
            </div>

            <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in;
        }
      `}</style>
        </div>
    );
}
