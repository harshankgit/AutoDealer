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

interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  ownershipHistory: string;
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
    features?: string[];
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
  adminid: {
    id: string;
    username: string;
    email: string;
  } | null;
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
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingPhoneNumber, setBookingPhoneNumber] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (!carId) return; // wait until route param is available
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));

    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    fetchCar();
  }, [carId, router]);

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

  const toggleFavorite = () => {
    if (!car) return;

    const newFavorites = favorites.includes(car.id)
      ? favorites.filter((id) => id !== car.id)
      : [...favorites, car.id];

    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
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
                      <span className="font-medium">Fuel:</span> {car.fuelType}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      <span className="font-medium">Owner:</span>{" "}
                      {car.ownershipHistory}
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
              {user && user.id !== car.adminid && (
                <Link href={`/chat/${car.id}`} className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat with Dealer
                  </Button>
                </Link>
              )}
              {user && user.id !== car.adminid && (
                <Button
                  variant="outline"
                  onClick={toggleFavorite}
                  className={
                    favorites.includes(car.id)
                      ? "text-red-600 border-red-600"
                      : ""
                  }
                >
                  <Heart
                    className={`h-4 w-4 ${
                      favorites.includes(car.id) ? "fill-current" : ""
                    }`}
                  />
                </Button>
              )}
              {user && user.id !== car.adminid && (
                <Button
                  onClick={() => setIsBookingDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Car
                </Button>
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
                      Contact admin for location
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Contact Person: {car.adminid?.username || "Unknown"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-foreground">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      Contact admin for details
                    </div>
                    <div className="flex items-center text-sm text-foreground">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      Contact admin for details
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

                {car.specifications.features &&
                  car.specifications.features.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="font-medium mb-2 text-foreground">
                          Features:
                        </h4>
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
