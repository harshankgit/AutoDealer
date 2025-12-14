'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Car, Heart, MessageCircle, Search, Filter, Fuel, Calendar, Users, Eye, Loader2, Trash2, Edit, ArrowLeft, ChevronLeft, ChevronRight, X, Plus, Minus } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useUser } from '@/context/user-context'; // Import useUser
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { RoomDetailsSkeleton } from '@/components/skeletons/RoomDetailsSkeleton';

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
  adminid: {
    id: string;
    username: string;
    email: string;
  } | null;
  specifications: {
    engine?: string;
    power?: string;
    torque?: string;
    acceleration?: string;
    topSpeed?: string;
    features?: string[];
  };
  createdAt: string;
}

interface Room {
  id: string;
  name: string;
  description: string;
  location: string;
  image: string;
  adminid: {
    id?: string;
    username: string;
    email: string;
  } | null;
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
  };
}

export default function RoomDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const roomid = params?.id && Array.isArray(params.id) ? params.id[0] : params?.id || '';

  const [room, setRoom] = useState<Room | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedFuelType, setSelectedFuelType] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const { user, loading } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  // const [user, setUser] = useState<any>(null); // Remove local user state
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isEditCarDialogOpen, setIsEditCarDialogOpen] = useState(false);
  const [currentCar, setCurrentCar] = useState<Car | null>(null);
  const [editCarFormData, setEditCarFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: 0,
    price: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    ownershipHistory: '',
    images: '',
    description: '',
    condition: '',
    engine: '',
    power: '',
    torque: '',
    acceleration: '',
    topSpeed: '',
    features: '',
  });
  const [isSavingCar, setIsSavingCar] = useState(false);
  const [editCarError, setEditCarError] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // New state for delete dialog
  const [carToDeleteId, setCarToDeleteId] = useState<string | null>(null); // New state to store car ID to delete
  const [favoriteCarIds, setFavoriteCarIds] = useState<string[]>([]);

  // Fetch user's favorites when user is loaded
  useEffect(() => {
    if (!user) return; // wait until user data is available

    fetchUserFavorites();
  }, [user]);

  // Fetch room and cars data when user is loaded
  useEffect(() => {
    if (!roomid) return; // wait until route param is available
    if (loading) return; // Wait until user is loaded

    if (!user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        await fetchRoomAndCars();
      } catch (error) {
        console.error('Error fetching room data:', error);
        setError('Failed to load room data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [roomid, user, loading]); // Use loading from context

  useEffect(() => {
    applyFilters();
  }, [searchTerm, priceRange, selectedFuelType, selectedAvailability, cars]);

  const fetchRoomAndCars = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Fetch room details and cars in parallel
    const [roomResponse, carsResponse] = await Promise.all([
      fetch(`/api/rooms/${roomid}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      }),
      fetch(`/api/cars?roomid=${roomid}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      })
    ]);

    // Handle room response
    if (!roomResponse.ok) {
      if (roomResponse.status === 401) {
        router.push('/login');
        return;
      }
      const errorData = await roomResponse.json();
      throw new Error(errorData.error || 'Failed to fetch room details');
    }

    const roomData = await roomResponse.json();
    setRoom(roomData.room);

    // Handle cars response
    if (!carsResponse.ok) {
      if (carsResponse.status === 401) {
        router.push('/login');
        return;
      }
      const errorData = await carsResponse.json();
      throw new Error(errorData.error || 'Failed to fetch cars');
    }

    const carsData = await carsResponse.json();
    setCars(carsData.cars);
    setFilteredCars(carsData.cars);
  };

  const handleDeleteCar = (carId: string) => {
    setCarToDeleteId(carId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCar = async () => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      setError('Only admins can delete cars.');
      return;
    }

    if (!carToDeleteId) return;

    try {
      const response = await fetch(`/api/cars/${carToDeleteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        setCars(prevCars => prevCars.filter(car => car.id !== carToDeleteId));
        setFilteredCars(prevFilteredCars => prevFilteredCars.filter(car => car.id !== carToDeleteId));
        setError('Car deleted successfully.');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete car.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsDeleteDialogOpen(false);
      setCarToDeleteId(null);
    }
  };

  const handleEditCarClick = (car: Car) => {
    setCurrentCar(car);
    setEditCarFormData({
      title: car.title,
      brand: car.brand,
      model: car.model,
      year: car.year,
      price: car.price.toString(),
      mileage: car.mileage.toString(),
      fuelType: car.fuelType,
      transmission: car.transmission,
      ownershipHistory: car.ownershipHistory,
      images: car.images.join(', '),
      description: car.description,
      condition: car.condition,
      engine: car.specifications?.engine || '',
      power: car.specifications?.power || '',
      torque: car.specifications?.torque || '',
      acceleration: car.specifications?.acceleration || '',
      topSpeed: car.specifications?.topSpeed || '',
      features: car.specifications?.features?.join(', ') || '',
    });
    setIsEditCarDialogOpen(true);
  };

  const handleEditCarInputChange = (field: string, value: string | number) => {
    setEditCarFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveCarEdit = async () => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      toast({
        title: 'Unauthorized',
        description: 'Only admins can edit cars.',
        variant: 'destructive',
      });
      return;
    }

    if (!currentCar) return;

    setIsSavingCar(true);
    setEditCarError('');

    try {
      const payload = {
        title: editCarFormData.title,
        brand: editCarFormData.brand,
        model: editCarFormData.model,
        year: Number(editCarFormData.year),
        price: Number(editCarFormData.price),
        mileage: Number(editCarFormData.mileage),
        fuelType: editCarFormData.fuelType,
        transmission: editCarFormData.transmission,
        ownershipHistory: editCarFormData.ownershipHistory,
        images: editCarFormData.images.split(',').map(img => img.trim()).filter(img => img !== ''),
        description: editCarFormData.description,
        condition: editCarFormData.condition,
        specifications: {
          engine: editCarFormData.engine,
          power: editCarFormData.power,
          torque: editCarFormData.torque,
          acceleration: editCarFormData.acceleration,
          topSpeed: editCarFormData.topSpeed,
          features: editCarFormData.features.split(',').map(f => f.trim()).filter(f => f !== ''),
        },
      };

      const response = await fetch(`/api/cars/${currentCar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedCar = await response.json();
        setCars(prevCars => prevCars.map(car => car.id === updatedCar.id ? updatedCar : car));
        setFilteredCars(prevFilteredCars => prevFilteredCars.map(car => car.id === updatedCar.id ? updatedCar : car));
        setIsEditCarDialogOpen(false);

        toast({
          title: 'Success',
          description: 'Car details updated successfully!',
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update car. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingCar(false);
    }
  };

  const applyFilters = () => {
    let filtered = cars.filter(car => {
      const matchesSearch = car.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           car.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPrice = (!priceRange.min || car.price >= parseInt(priceRange.min)) &&
                          (!priceRange.max || car.price <= parseInt(priceRange.max));

      const matchesFuelType = !selectedFuelType || car.fuelType === selectedFuelType;
      const matchesAvailability = !selectedAvailability || car.availability === selectedAvailability;

      return matchesSearch && matchesPrice && matchesFuelType && matchesAvailability;
    });

    setFilteredCars(filtered);
  };

  const fetchUserFavorites = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavoriteCarIds(data.favorites);
      }
    } catch (err) {
      console.error('Error fetching user favorites:', err);
    }
  };

  const toggleFavorite = async (carId: string) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      if (favoriteCarIds.includes(carId)) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?carId=${encodeURIComponent(carId)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setFavoriteCarIds(prev => prev.filter(id => id !== carId));
          toast({
            title: "Removed from favorites",
            description: "Car removed from your favorites list.",
            duration: 3000, // Auto-dismiss after 3 seconds
          });
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ carId }),
        });

        if (response.ok) {
          setFavoriteCarIds(prev => [...prev, carId]);
          toast({
            title: "Added to favorites",
            description: "Car added to your favorites list.",
            duration: 3000, // Auto-dismiss after 3 seconds
          });
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
        duration: 3000, // Auto-dismiss after 3 seconds
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return <RoomDetailsSkeleton />;
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Showroom Not Found</h2>
          <p className="text-gray-500 mb-6">The showroom you're looking for doesn't exist.</p>
          <Link href="/rooms">
            <Button>Browse Other Showrooms</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 overflow-x-hidden">
      <div className="mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6 max-w-7xl">
        {/* Room Header */}
        <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-6 sm:mb-8">
          <div className="relative h-48 sm:h-64 md:h-80">
            <img
              src={room.image}
              alt={room.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">{room.name}</h1>
              <div className="flex items-center text-base sm:text-lg opacity-90 mb-1 sm:mb-2">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                {room.location}
              </div>
              <div className="flex items-center text-xs sm:text-sm opacity-80">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Dealer: {room.adminid?.username || 'Unknown'}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <p className="text-gray-600 text-base sm:text-lg mb-3 sm:mb-4">{room.description}</p>

            {room.contactInfo && (
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                {room.contactInfo.phone && (
                  <span className="flex items-center">
                    <span className="mr-1">📞</span> {room.contactInfo.phone}
                  </span>
                )}
                {room.contactInfo.email && (
                  <span className="flex items-center">
                    <span className="mr-1">✉️</span> {room.contactInfo.email}
                  </span>
                )}
                {room.contactInfo.address && (
                  <span className="flex items-center">
                    <span className="mr-1">📍</span> {room.contactInfo.address}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Filter Cars</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search cars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 dark:bg-gray-800 dark:text-white dark:border-gray-700"
              />
            </div>

            <Input
              type="number"
              placeholder="Min Price"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
            />

            <Input
              type="number"
              placeholder="Max Price"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
            />

            <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
              <SelectTrigger className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                <SelectValue placeholder="Fuel Type" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                <SelectItem value="Petrol">Petrol</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="Electric">Electric</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
              <SelectTrigger className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cars Grid */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {filteredCars.length === 0 ? (
          <div className="text-center py-16">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || priceRange.min || priceRange.max || selectedFuelType || selectedAvailability
                ? 'No cars match your filters'
                : 'No cars available in this showroom'
              }
            </h3>
            <p className="text-gray-500">
              {searchTerm || priceRange.min || priceRange.max || selectedFuelType || selectedAvailability
                ? 'Try adjusting your search criteria.'
                : 'The dealer hasn\'t added any cars yet.'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Available Cars ({filteredCars.length})
              </h2>
              {user?.role === 'admin' && room.adminid?.id === user.id && (
                <Link href={`/admin/add-car`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Car to Room
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredCars.map((car) => (
                <Card key={car.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-white dark:bg-gray-800 rounded-xl">
                  <div className="relative h-48 overflow-hidden">
                    {car.images && car.images.length > 0 ? (
                      <Carousel className="w-full h-full">
                        <CarouselContent className="h-48">
                          {car.images.map((image, index) => (
                            <CarouselItem key={index} className="h-full">
                              <img
                                src={image}
                                alt={`${car.title} - ${index + 1}`}
                                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = "https://placehold.co/400x300?text=No+Image";
                                }}
                              />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        {car.images.length > 1 && (
                          <>
                            <CarouselPrevious className="absolute left-2 top-1/2 h-8 w-8" />
                            <CarouselNext className="absolute right-2 top-1/2 h-8 w-8" />
                          </>
                        )}
                      </Carousel>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <div className="text-center">
                          <Car className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                          <p className="text-gray-500 dark:text-gray-400 text-sm">No Image</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-black/70 text-white">
                        {car.images?.length || 0} {car.images?.length === 1 ? 'photo' : 'photos'}
                      </Badge>
                    </div>
                    {user?.role === 'admin' && room.adminid?.id === user.id && (
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditCarClick(car)}
                          className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCar(car.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{car.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{car.brand} • {car.model} • {car.year}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(car.id);
                        }}
                        className="text-gray-400 hover:text-red-500 focus:outline-none p-1 ml-2 flex-shrink-0"
                        aria-label={favoriteCarIds.includes(car.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart
                          className={`h-5 w-5 ${favoriteCarIds.includes(car.id) ? 'fill-red-500 text-red-500' : ''}`}
                        />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-xl font-bold text-blue-600 dark:text-white">
                        {formatPrice(car.price)}
                      </div>
                      <div className="flex gap-1">
                        <div className="flex items-center text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          <Calendar className="h-3 w-3 mr-1 text-gray-600 dark:text-gray-300" />
                          <span className="text-gray-600 dark:text-gray-300">{car.mileage.toLocaleString()} miles</span>
                        </div>
                        <div className="flex items-center text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          <Fuel className="h-3 w-3 mr-1 text-gray-600 dark:text-gray-300" />
                          <span className="text-gray-600 dark:text-gray-300">{car.fuelType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200">
                        {car.condition}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200">
                        {car.transmission}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/50 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-200">
                        {car.ownershipHistory}
                      </Badge>
                    </div>
                  <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      {user?.role === 'admin' && room.adminid?.id === user.id ? (
                        // Show admin controls if user is the room owner
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 flex items-center justify-center gap-1 text-sm"
                            onClick={() => handleEditCarClick(car)}
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1 flex items-center justify-center gap-1 text-sm"
                            onClick={() => handleDeleteCar(car.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </>
                      ) : user?.role === 'admin' ? (
                        // Show chat and view buttons for other admins, but not if the admin is viewing their own car
                        <>
                          {user.id !== car.adminid?.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 flex items-center justify-center gap-1 text-sm"
                              onClick={() => router.push(`/chat/${car.id}`)}
                            >
                              <MessageCircle className="h-4 w-4" />
                              Chat
                            </Button>
                          )}
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 flex items-center justify-center gap-1 text-sm bg-blue-600 hover:bg-blue-700"
                            onClick={() => router.push(`/cars/${car.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </>
                      ) : (
                        // Show for non-admin users
                        <>
                          <Link href={`/cars/${car.id}`} className="flex-1">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                          <Link href={`/chat/${car.id}`} className="flex">
                            <Button variant="outline" size="icon" className="h-9 w-9">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
                ))}
            </div>
          </>
        )}

        {/* Edit Car Dialog */}
        <Dialog open={isEditCarDialogOpen} onOpenChange={setIsEditCarDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Car Details</DialogTitle>
              <DialogDescription>
                Make changes to the car details here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Basic Information */}
              <h4 className="text-lg font-semibold">Basic Information</h4>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editTitle" className="text-right">Title</Label>
                <Input
                  id="editTitle"
                  value={editCarFormData.title}
                  onChange={(e) => handleEditCarInputChange('title', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editBrand" className="text-right">Brand</Label>
                <Input
                  id="editBrand"
                  value={editCarFormData.brand}
                  onChange={(e) => handleEditCarInputChange('brand', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editModel" className="text-right">Model</Label>
                <Input
                  id="editModel"
                  value={editCarFormData.model}
                  onChange={(e) => handleEditCarInputChange('model', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editYear" className="text-right">Year</Label>
                <Input
                  id="editYear"
                  type="number"
                  value={editCarFormData.year}
                  onChange={(e) => handleEditCarInputChange('year', parseInt(e.target.value))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editPrice" className="text-right">Price (INR)</Label>
                <Input
                  id="editPrice"
                  type="number"
                  value={editCarFormData.price}
                  onChange={(e) => handleEditCarInputChange('price', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editMileage" className="text-right">Mileage</Label>
                <Input
                  id="editMileage"
                  type="number"
                  value={editCarFormData.mileage}
                  onChange={(e) => handleEditCarInputChange('mileage', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editFuelType" className="text-right">Fuel Type</Label>
                <Select value={editCarFormData.fuelType} onValueChange={(value) => handleEditCarInputChange('fuelType', value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editTransmission" className="text-right">Transmission</Label>
                <Select value={editCarFormData.transmission} onValueChange={(value) => handleEditCarInputChange('transmission', value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editOwnershipHistory" className="text-right">Ownership</Label>
                <Select value={editCarFormData.ownershipHistory} onValueChange={(value) => handleEditCarInputChange('ownershipHistory', value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select ownership" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Owner">1st Owner</SelectItem>
                    <SelectItem value="2nd Owner">2nd Owner</SelectItem>
                    <SelectItem value="3rd Owner">3rd Owner</SelectItem>
                    <SelectItem value="4th+ Owner">4th+ Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editCondition" className="text-right">Condition</Label>
                <Select value={editCarFormData.condition} onValueChange={(value) => handleEditCarInputChange('condition', value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Very Good">Very Good</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Images */}
              <Separator className="my-4" />
              <h4 className="text-lg font-semibold">Car Images</h4>
              <p className="text-sm text-gray-600">Enter image URLs, separated by commas.</p>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="editImages" className="text-right">Image URLs</Label>
                <Textarea
                  id="editImages"
                  value={editCarFormData.images}
                  onChange={(e) => handleEditCarInputChange('images', e.target.value)}
                  className="col-span-3"
                  rows={4}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.png"
                />
              </div>

              {/* Description */}
              <Separator className="my-4" />
              <h4 className="text-lg font-semibold">Description</h4>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="editDescription" className="text-right">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editCarFormData.description}
                  onChange={(e) => handleEditCarInputChange('description', e.target.value)}
                  className="col-span-3"
                  rows={6}
                />
              </div>

              {/* Specifications */}
              <Separator className="my-4" />
              <h4 className="text-lg font-semibold">Technical Specifications (Optional)</h4>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editEngine" className="text-right">Engine</Label>
                <Input
                  id="editEngine"
                  value={editCarFormData.engine}
                  onChange={(e) => handleEditCarInputChange('engine', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editPower" className="text-right">Power</Label>
                <Input
                  id="editPower"
                  value={editCarFormData.power}
                  onChange={(e) => handleEditCarInputChange('power', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editTorque" className="text-right">Torque</Label>
                <Input
                  id="editTorque"
                  value={editCarFormData.torque}
                  onChange={(e) => handleEditCarInputChange('torque', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editAcceleration" className="text-right">0-60 mph</Label>
                <Input
                  id="editAcceleration"
                  value={editCarFormData.acceleration}
                  onChange={(e) => handleEditCarInputChange('acceleration', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editTopSpeed" className="text-right">Top Speed</Label>
                <Input
                  id="editTopSpeed"
                  value={editCarFormData.topSpeed}
                  onChange={(e) => handleEditCarInputChange('topSpeed', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="editFeatures" className="text-right">Features (comma-separated)</Label>
                <Textarea
                  id="editFeatures"
                  value={editCarFormData.features}
                  onChange={(e) => handleEditCarInputChange('features', e.target.value)}
                  className="col-span-3"
                  rows={3}
                  placeholder="Leather Seats, Navigation System, Sunroof"
                />
              </div>

              {editCarError && <p className="text-red-500 text-sm text-center">{editCarError}</p>}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleSaveCarEdit}
                disabled={isSavingCar}
              >
                {isSavingCar && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Car Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the car
                and remove its data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteCar} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Display (General) */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

      </div>
    </div>
  );
}