'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Car, Eye, MessageCircle, Calendar, Fuel, Users, Loader2 } from 'lucide-react';

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
  condition: string;
  availability: string;
  roomid?: string;
  roomInfo?: {
    id: string;
    name: string;
    location: string;
    description?: string;
    image?: string;
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteCars, setFavoriteCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      const favoriteIds = JSON.parse(savedFavorites);
      setFavorites(favoriteIds);
      fetchFavoriteCars(favoriteIds);
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const fetchFavoriteCars = async (favoriteIds: string[]) => {
    if (favoriteIds.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const carPromises = favoriteIds.map(id =>
        fetch(`/api/cars/${id}`).then(res => res.json())
      );

      const carResults = await Promise.all(carPromises);
      const validCars = carResults
        .filter(result => result.car)
        .map(result => result.car);

      // Fetch room information for each unique room ID
      const roomIds = Array.from(new Set(validCars.map(car => car.roomid))).filter(Boolean) as string[];
      const roomMap: Record<string, any> = {};

      if (roomIds.length > 0) {
        for (const roomid of roomIds) {
          try {
            const response = await fetch(`/api/rooms/${roomid}`);
            if (response.ok) {
              const roomData = await response.json();
              roomMap[roomid] = roomData.room;
            }
          } catch (err) {
            console.error(`Failed to fetch room ${roomid}:`, err);
          }
        }
      }

      // Add room information to each car
      const carsWithRoomInfo = validCars.map(car => ({
        ...car,
        roomInfo: roomMap[car.roomid || car.roomid] || null
      }));

      setFavoriteCars(carsWithRoomInfo);
    } catch (error) {
      setError('Failed to load favorite cars');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = (carId: string) => {
    const newFavorites = favorites.filter(id => id !== carId);
    setFavorites(newFavorites);
    setFavoriteCars(prev => prev.filter(car => car.id !== carId));
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Your Favorite Cars
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Keep track of cars you're interested in and compare them easily.
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          </div>
        )}

        {favoriteCars.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No favorite cars yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start browsing cars and add them to your favorites by clicking the heart icon.
            </p>
            <Link href="/rooms">
              <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                <Car className="h-4 w-4 mr-2" />
                Browse Cars
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {favoriteCars.length} Favorite{favoriteCars.length !== 1 ? 's' : ''}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoriteCars.map((car) => (
                <Card key={car.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={car.images[0] || 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg'}
                      alt={car.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Badge 
                        variant={car.availability === 'Available' ? 'default' : 'secondary'}
                        className={car.availability === 'Available' ? 'bg-green-600' : 'bg-gray-600'}
                      >
                        {car.availability}
                      </Badge>
                    </div>
                    <button
                      onClick={() => removeFavorite(car.id)}
                      className="absolute top-4 left-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </button>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {car.title}
                    </CardTitle>
                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                      <p>{car.year} • {car.brand} {car.model}</p>
                      <p>From: {car.roomInfo?.name || 'Showroom'}</p>
                      {car.roomInfo?.location && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">{car.roomInfo.location}</p>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatPrice(car.price)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-600 dark:text-gray-400" />
                          {car.mileage.toLocaleString()} miles
                        </div>
                        <div className="flex items-center">
                          <Fuel className="h-4 w-4 mr-1 text-gray-600 dark:text-gray-400" />
                          {car.fuelType}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-600 dark:text-gray-400" />
                          {car.ownershipHistory}
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="text-xs dark:border-gray-600">
                            {car.condition}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Link href={`/cars/${car.id}`} className="flex-1">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/chat/${car.id}`}>
                          <Button variant="outline" size="icon">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Your Favorites Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {favoriteCars.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Favorites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {favoriteCars.filter(car => car.availability === 'Available').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {formatPrice(
                      favoriteCars.reduce((avg, car) => avg + car.price, 0) / favoriteCars.length || 0
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Price</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                    {new Set(favoriteCars.map(car => car.roomInfo?.id)).size}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Different Showrooms</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}