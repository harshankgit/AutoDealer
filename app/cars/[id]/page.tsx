"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Calendar,
  Fuel,
  Users,
  Settings,
  MapPin,
  Phone,
  Mail,
  Loader2,
  CreditCard,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CarDetailsSkeleton } from "@/components/skeletons/CarDetailsSkeleton";
import { useUser } from "@/context/user-context";

interface Booking {
  id: string;
  carid: string;
  userid: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  created_at: string;
}

interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  ownership_history: string;
  images: string[];
  description: string;
  condition: string;
  availability: string;
  specifications: {
    engine?: string;
    power?: string;
    torque?: string;
    acceleration?: string;
    topSpeed?: string;
    features?: string[] | string;
  };
  roomid: {
    id: string;
    name: string;
    location: string;
    contactInfo: {
      phone?: string;
      email?: string;
      address?: string;
    };
  };
  admin_details: {
    id: string;
    username: string;
    email: string;
    phone?: string;
    role: string;
    created_at: string;
  } | null;
  adminid: string; // Store just the admin ID as a string
  createdAt: string;
}

export default function CarDetailsPage() {
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
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingPhoneNumber, setBookingPhoneNumber] = useState("");
  const [bookingAmount, setBookingAmount] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const { user } = useUser();

  useEffect(() => {
    if (!carId || !user) return; // wait until route param and user data is available

    fetchCar();
    checkIfFavorite();
    fetchActiveBooking();
  }, [carId, user]);

  const fetchActiveBooking = async () => {
    if (!user || !carId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/user/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const bookingsForThisCar = data.bookings?.filter((booking: Booking) =>
          booking.carid === carId &&
          booking.userid === user.id
        ) || [];

        // Find the booking with status 'Booked', 'Confirmed', or 'Pending'
        const activeBooking = bookingsForThisCar.find((booking: Booking) =>
          ['Pending', 'Booked', 'Confirmed'].includes(booking.status)
        );

        setActiveBooking(activeBooking || null);
      }
    } catch (error) {
      console.error("Error fetching user bookings:", error);
    }
  };

  const checkIfFavorite = async () => {
    if (!carId || !user) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const favoriteIds = data.favorites;
        setIsFavorite(favoriteIds.includes(carId));
      }
    } catch (err) {
      console.error("Error checking if car is favorite:", err);
    }
  };

  const fetchCar = async () => {
    try {
      const response = await fetch(`/api/cars/${carId}`);
      const data = await response.json();

      if (response.ok) {
        setCar(data.car);
      } else {
        setError(data.error || "Failed to fetch car details");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!car || !user) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(
          `/api/favorites?carId=${encodeURIComponent(car.id)}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setIsFavorite(false);
        }
      } else {
        // Add to favorites
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ carId: car.id }),
        });

        if (response.ok) {
          setIsFavorite(true);
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setError("Failed to update favorites");
    }
  };

  const handleSubmitBooking = async () => {
    if (!user || !car) {
      setBookingError("User or car data is missing.");
      return;
    }

    if (!bookingPhoneNumber) {
      setBookingError("Please enter your phone number.");
      return;
    }

    setIsBookingLoading(true);
    setBookingError("");
    setBookingSuccess(false);

    // Validate booking amount
    if (bookingAmount && (isNaN(Number(bookingAmount)) || Number(bookingAmount) <= 0)) {
      setBookingError("Please enter a valid booking amount");
      setIsBookingLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carId: car.id,
          userId: user.id,
          bookingDetails: {
            phone: bookingPhoneNumber,
            notes: bookingNotes,
            bookingAmount: bookingAmount ? Number(bookingAmount) : undefined
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBookingSuccess(true);
        setBookingPhoneNumber("");
        setBookingNotes("");
        setTimeout(() => {
          setIsBookingDialogOpen(false);
          setBookingSuccess(false);
        }, 3000); // Close dialog and clear success message after 3 seconds
      } else {
        setBookingError(data.error || "Failed to submit booking.");
      }
    } catch (error) {
      console.error("Frontend booking error:", error);
      setBookingError("Network error. Please try again.");
    } finally {
      setIsBookingLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      // Changed locale to en-IN
      style: "currency",
      currency: "INR", // Changed currency to INR
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return <CarDetailsSkeleton />;
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-2">
            Car Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            {error || "The car you're looking for doesn't exist."}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href={`/rooms/${car.roomid || car.roomid}`}>
            <Button
              variant="outline"
              className="mb-4 w-full sm:w-auto text-center break-words whitespace-normal"
            >
              <ArrowLeft className="h-4 w-4 mr-2 shrink-0" />
              Back to Showroom
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative h-96 rounded-xl overflow-hidden shadow-lg">
              {car.images && car.images.length > 0 ? (
                <img
                  src={car.images[selectedImage]}
                  alt={car.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Car image not available
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <Badge
                  variant={
                    car.availability === "Available" ? "default" : "secondary"
                  }
                  className={
                    car.availability === "Available"
                      ? "bg-green-600"
                      : "bg-gray-600"
                  }
                >
                  {car.availability}
                </Badge>
              </div>
            </div>

            {car.images && car.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {car.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? "border-blue-600"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${car.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Car Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {car.title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                {car.year} {car.brand} {car.model}
              </p>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-4">
                {formatPrice(car.price)}
              </div>
            </div>

            {/* Key Specs */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center text-card-foreground">
                  <Settings className="h-5 w-5 mr-2 text-muted-foreground" />
                  Key Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      <span className="font-medium">Mileage:</span>{" "}
                      {car.mileage.toLocaleString()} miles
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Fuel className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      <span className="font-medium">Fuel:</span>{" "}
                      {car?.fuel_type}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      <span className="font-medium">Owner:</span>{" "}
                      {car.ownership_history}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      <span className="font-medium">Transmission:</span>{" "}
                      {car.transmission}
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Condition:
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-secondary text-secondary-foreground"
                  >
                    {car.condition}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 sm:flex-nowrap">
              {user && car.adminid && user.id !== car.adminid && (
                <Link href={`/chat/${car.id}`} className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat with Dealer
                  </Button>
                </Link>
              )}
              {user && car.adminid && user.id !== car.adminid && (
                <Button
                  variant="outline"
                  onClick={toggleFavorite}
                  className={isFavorite ? "text-red-600 border-red-600" : ""}
                >
                  <Heart
                    className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                  />
                </Button>
              )}
              {user && car.adminid && user.id !== car.adminid && (
                <Button
                  onClick={() => setIsBookingDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Car
                </Button>
              )}
              {/* Show payment button only if user has an active booking for this car */}
              {user && car.adminid && user.id !== car.adminid  && (
                <Link href={`/payment/${car.id}`} className="flex-1">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Make Payment
                  </Button>
                </Link>
              )}
            </div>

            {/* Booking Dialog */}
            <Dialog
              open={isBookingDialogOpen}
              onOpenChange={setIsBookingDialogOpen}
            >
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Book Car</DialogTitle>
                  <DialogDescription>
                    Fill in your details to book a test drive or inquire about
                    the car.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g., +1234567890"
                      value={bookingPhoneNumber}
                      onChange={(e) => setBookingPhoneNumber(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="bookingAmount" className="text-right">
                      Booking Amount
                    </Label>
                    <Input
                      id="bookingAmount"
                      type="number"
                      placeholder="e.g., 50000"
                      value={bookingAmount}
                      onChange={(e) => setBookingAmount(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-baseline gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Any specific questions or preferred time?"
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  {bookingError && (
                    <p className="text-red-500 text-sm text-center">
                      {bookingError}
                    </p>
                  )}
                  {bookingSuccess && (
                    <p className="text-green-500 text-sm text-center">
                      Booking request sent!
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleSubmitBooking}
                    disabled={isBookingLoading}
                  >
                    {isBookingLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit Booking
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Active Booking Info */}
            {activeBooking && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 dark:bg-blue-900/20 dark:border-blue-800">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-800">
                      <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Active Booking
                    </h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                      <p>
                        You have an active booking for this car. After negotiating the price with the dealer,
                        you can proceed with payment using the "Make Payment" button.
                      </p>
                      <p className="mt-2 font-semibold">
                        Booking Status: <span className="capitalize">{activeBooking.status}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dealer Info */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center text-card-foreground">
                  <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                  Dealer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-foreground">
                      Showroom ID: #
                      {(car.roomid || car.roomid)
                        ?.toString()
                        .slice(0, 5)
                        .toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {car.admin_details?.phone || "Contact admin for location"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Contact Person: {car.admin_details?.username || "Unknown"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-foreground">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      {car.admin_details?.phone || "Contact admin for details"}
                    </div>
                    <div className="flex items-center text-sm text-foreground">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      {car.admin_details?.email || "Contact admin for details"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Description and Specifications */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Description */}
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">
                {car.description}
              </p>
            </CardContent>
          </Card>

          {/* Detailed Specifications */}
          {car.specifications && (
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Detailed Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {car.specifications.engine && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Engine:</span>
                      <span className="font-medium text-foreground">
                        {car.specifications.engine}
                      </span>
                    </div>
                  )}
                  {car.specifications.power && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Power:</span>
                      <span className="font-medium text-foreground">
                        {car.specifications.power}
                      </span>
                    </div>
                  )}
                  {car.specifications.torque && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Torque:</span>
                      <span className="font-medium text-foreground">
                        {car.specifications.torque}
                      </span>
                    </div>
                  )}
                  {car.specifications.acceleration && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">0-60 mph:</span>
                      <span className="font-medium text-foreground">
                        {car.specifications.acceleration}
                      </span>
                    </div>
                  )}
                  {car.specifications.topSpeed && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Top Speed:</span>
                      <span className="font-medium text-foreground">
                        {car.specifications.topSpeed}
                      </span>
                    </div>
                  )}
                </div>

                {car.specifications.features && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="font-medium mb-2 text-foreground">
                        Features:
                      </h4>
                      <div className="space-y-2">
                        {Array.isArray(car.specifications.features) ? (
                          // If features is an array
                          car.specifications.features.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {car.specifications.features.map((feature, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs bg-secondary text-secondary-foreground"
                                >
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          ) : null
                        ) : (
                          // If features is a string/blob, format it properly
                          <div className="prose prose-sm max-w-none dark:prose-invert text-foreground">
                            {typeof car.specifications.features === 'string' ? (
                              car.specifications.features.split('\n').map((line, index) => {
                                // Check if the line looks like a section header (contains colon)
                                const colonIndex = line.indexOf(':');
                                if (colonIndex > 0) {
                                  const header = line.substring(0, colonIndex).trim();
                                  const content = line.substring(colonIndex + 1).trim();

                                  // Only treat as header if the header part starts with uppercase and looks like a category
                                  if (/^[A-Z]/.test(header) && header.length > 1) {
                                    return (
                                      <div key={index} className="mb-2">
                                        <h5 className="font-semibold text-base text-foreground mb-1">{header}:</h5>
                                        {content && (
                                          <p className="text-sm text-muted-foreground leading-relaxed">
                                            {content}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  }
                                }

                                // For lines that are not headers, just display as paragraph if not empty
                                const trimmedLine = line.trim();
                                return trimmedLine ? (
                                  <p key={index} className="text-sm text-muted-foreground mb-1">
                                    {trimmedLine}
                                  </p>
                                ) : null;
                              })
                            ) : (
                              <p className="text-sm text-muted-foreground">No features listed</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
