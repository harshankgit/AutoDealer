"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Send,
  Car,
  User,
  MessageCircle,
  Loader2,
  Paperclip,
  X,
} from "lucide-react";

interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  images: string[];
  roomId: {
    id: string;
    name: string;
  };
  adminid: {
    id: string;
    username: string;
  };
}

interface Message {
  id: string;
  senderId: {
    id: string;
    username: string;
  };
  message: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  timestamp: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const p = params ?? {};
  const carId =
    typeof (p as any).id === "string"
      ? (p as any).id
      : Array.isArray((p as any).id)
      ? (p as any).id[0]
      : undefined;

  const [car, setCar] = useState<Car | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!carId) return; // wait until param available
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userData || !token) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
    fetchCarAndMessages(token);
  }, [carId, router]);

  const fetchCarAndMessages = async (token: string) => {
    try {
      setError("");

      // Fetch car details (public)
      const carResponse = await fetch(`/api/cars/${carId}`);
      const carData = await carResponse.json();

      if (carResponse.ok) {
        setCar(carData.car);
      } else {
        setCar(null);
        setError(carData.error || "Car not found");
        setIsLoading(false);
        return;
      }

      // Fetch chat for this car (requires auth)
      const chatResponse = await fetch(`/api/chat?carId=${carId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (chatResponse.status === 401) {
        // Unauthorized — token expired or invalid
        setError("Unauthorized. Please login again.");
        // optional: redirect to login
        // router.push('/login');
        setMessages([]);
        setIsLoading(false);
        return;
      }

      const chatData = await chatResponse.json();

      if (chatResponse.ok) {
        if (chatData.chat) {
          setMessages(chatData.chat.messages || []);
        } else {
          setMessages([]); // No existing chat, start fresh
        }
      } else {
        setError(chatData.error || "Failed to fetch messages");
        setMessages([]);
      }
    } catch (err) {
      console.error("fetchCarAndMessages error:", err);
      setError("Failed to load chat");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !user || !car) return;

    setIsSending(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found.");
        setIsSending(false);
        router.push("/login");
        return;
      }

      let fileId = null;
      let fileName = null;
      let fileType = null;

      // Upload file if selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);

        const token = localStorage.getItem("token");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const uploadError = await uploadRes.json();
          setError(uploadError.error || "File upload failed");
          setIsSending(false);
          return;
        }

        const uploadData = await uploadRes.json();
        fileId = uploadData.fileId;
        fileName = uploadData.fileName;
        fileType = uploadData.fileType;
      }

      // Ensure receiver exists
      if (!car.adminid?.id) {
        setError("Receiver (dealer) not available for this car.");
        setIsSending(false);
        return;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          carId: car.id,
          receiverId: car.adminid.id,
          message: newMessage || null,
          fileId,
          fileName,
          fileType,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setError("Unauthorized. Please login again.");
        router.push("/login");
        return;
      }

      if (response.ok) {
        // Refresh messages and car info
        await fetchCarAndMessages(token);
        setNewMessage("");
        setSelectedFile(null);
        setUploadProgress(0);
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">
            Chat Not Available
          </h2>
          <p className="text-gray-500 mb-6">
            {error || "Unable to load chat for this car."}
          </p>
          <Link href="/rooms">
            <Button>Browse Cars</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href={`/cars/${car.id}`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Car Details
            </Button>
          </Link>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Car Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Car className="h-5 w-5 mr-2" />
                  Car Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative h-32 rounded-lg overflow-hidden">
                  <img
                    src={
                      car.images[0] ||
                      "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg"
                    }
                    alt={car.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {car.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {car.year} {car.brand} {car.model}
                  </p>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    {formatPrice(car.price)}
                  </p>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Showroom:</strong> {car.roomId.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Dealer:</strong>{" "}
                    {car.adminid?.username || "Unknown Dealer"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Chat with {car.adminid?.username || "Dealer"}
                </CardTitle>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      (message.senderId?.id || message.senderId) === user?.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                        (message.senderId?.id || message.senderId) === user?.id
                          ? "flex-row-reverse space-x-reverse"
                          : ""
                      }`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {message.senderId?.id === user?.id ? (
                            <User className="h-4 w-4" />
                          ) : (
                            message.senderId?.username
                              ?.charAt(0)
                              .toUpperCase() || "U"
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          (message.senderId?.id || message.senderId) ===
                          user?.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {message.fileUrl && (
                          <div className="mb-2">
                            {message.fileType === "image" && (
                              <img
                                src={message.fileUrl}
                                alt={message.fileName || "Image"}
                                className="max-w-xs rounded-lg"
                              />
                            )}
                            {message.fileType === "video" && (
                              <video
                                src={message.fileUrl}
                                controls
                                className="max-w-xs rounded-lg"
                              />
                            )}
                            {(message.fileType === "pdf" ||
                              message.fileType === "document") && (
                              <a
                                href={message.fileUrl}
                                download
                                className="flex items-center text-blue-400 hover:underline"
                              >
                                📄 {message.fileName}
                              </a>
                            )}
                            {message.fileType === "audio" && (
                              <audio src={message.fileUrl} controls />
                            )}
                          </div>
                        )}
                        {message.message && (
                          <p className="text-sm">{message.message}</p>
                        )}
                        <p
                          className={`text-xs mt-1 ${
                            (message.senderId?.id || message.senderId) ===
                            user?.id
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {isSending && (
                  <div className="flex justify-end">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Sending...</span>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4 space-y-3">
                {selectedFile && (
                  <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {selectedFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <form onSubmit={sendMessage} className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                    disabled={isSending}
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,video/*,.pdf,audio/*,.doc,.docx,.xls,.xlsx"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                      className="hidden"
                      disabled={isSending}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSending}
                      className="cursor-pointer"
                      onClick={() =>
                        (
                          document.querySelector(
                            'input[type="file"]'
                          ) as HTMLInputElement | null
                        )?.click()
                      }
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </label>
                  <Button
                    type="submit"
                    disabled={
                      (!newMessage.trim() && !selectedFile) || isSending
                    }
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>

        {/* Chat Notice */}
      </div>
    </div>
  );
}
