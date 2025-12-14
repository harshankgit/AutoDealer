'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Users, Car, Search, Loader2, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useUser } from '@/context/user-context'; // Import useUser hook
import { toast } from 'sonner';
import { RoomCardSkeleton } from '@/components/skeletons/RoomCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

interface Room {
  id: string;
  name: string;
  description: string;
  location: string;
  image: string;
  contact_info?: {
    phone?: string | null;
    email?: string | null;
    username?: string | null;
  };
  adminid: string; // Just the admin ID as a string
  createdAt: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  // const [user, setUser] = useState<any>(null); // Remove local user state
  const router = useRouter();
  const { user, loading } = useUser(); // Use user and loading from global context
  const [isEditRoomDialogOpen, setIsEditRoomDialogOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomDescription, setEditRoomDescription] = useState('');
  const [editRoomLocation, setEditRoomLocation] = useState('');
  const [editRoomImage, setEditRoomImage] = useState('');
  const [isSavingRoom, setIsSavingRoom] = useState(false);
  const [editRoomError, setEditRoomError] = useState('');
  useEffect(() => {
    // Wait until user loading finished before redirecting.
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchRooms();
    }
  }, [router, user, loading]); // Add user and loading to dependency array

  useEffect(() => {
    const filtered = rooms.filter(room =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.contact_info?.username && room.contact_info.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredRooms(filtered);
  }, [searchTerm, rooms]);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();

      if (response.ok) {
        setRooms(data.rooms);
        setFilteredRooms(data.rooms);
      } else {
        setError(data.error || 'Failed to fetch rooms');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = async (roomid: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      setError('Only admins can delete showrooms.');
      return;
    }

    try {
      const response = await fetch(`/api/rooms/${roomid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        setRooms(rooms.filter(room => room.id !== roomid));
        setFilteredRooms(filteredRooms.filter(room => room.id !== roomid));
        toast.success('Showroom deleted successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete showroom.');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  const handleEditClick = (room: Room) => {
    setCurrentRoom(room);
    setEditRoomName(room.name);
    setEditRoomDescription(room.description);
    setEditRoomLocation(room.location);
    setEditRoomImage(room.image);
    setIsEditRoomDialogOpen(true);
  };

  const handleSaveRoomEdit = async () => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      setEditRoomError('Only admins can edit showrooms.');
      return;
    }

    if (!currentRoom) return;

    setIsSavingRoom(true);
    setEditRoomError('');

    try {
      const response = await fetch(`/api/rooms/${currentRoom.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: editRoomName,
          description: editRoomDescription,
          location: editRoomLocation,
          image: editRoomImage,
        }),
      });

      if (response.ok) {
        const updatedRoom = await response.json();
        setRooms(rooms.map(room => room.id === currentRoom.id ? updatedRoom : room));
        setFilteredRooms(filteredRooms.map(room => room.id === currentRoom.id ? updatedRoom : room));
        setIsEditRoomDialogOpen(false);
        toast.success('Showroom updated successfully!');
      } else {
        const errorData = await response.json();
        setEditRoomError(errorData.error || 'Failed to update showroom.');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSavingRoom(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-96 mx-auto mb-4 rounded-xl" />
            <Skeleton className="h-6 w-[500px] mx-auto rounded-lg" />
          </div>

          {/* Search Bar Skeleton */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Skeleton className="h-12 w-full pl-10 rounded-lg" />
            </div>
          </div>

          {/* Rooms Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <RoomCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Browse Showrooms
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover cars from different dealers in their dedicated virtual showrooms.
            Each showroom offers a unique collection of vehicles.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by showroom name, location, or dealer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          </div>
        )}

        {/* Rooms Grid */}
        {filteredRooms.length === 0 ? (
          <div className="text-center py-16">
            <Car className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {searchTerm ? 'No showrooms found' : 'No showrooms available'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm
                ? 'Try adjusting your search terms to find what you\'re looking for.'
                : 'Be the first to create a showroom and start selling cars!'
              }
            </p>
            {user?.role === 'admin' && (
              <Link href="/admin">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Create Your Showroom
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRooms.map((room) => (
                <Card key={room.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-50">
                  <div className="relative h-48 overflow-hidden">
                    {room.image ? (
                      <img
                        src={room.image}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Car className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold mb-1 text-white">{room.name}</h3>
                      <div className="flex items-center text-sm opacity-90">
                        <MapPin className="h-4 w-4 mr-1" />
                        {room.location}
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardDescription className="text-gray-600 dark:text-gray-400 line-clamp-2">
                      {room.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-1" />
                        <span>Dealer: {room.contact_info?.username || 'Unknown'}</span>
                      </div>
                      {(
                        user?.role === 'superadmin' ||
                        (user?.role === 'admin' && String(room.adminid) === String(user?.id))
                      ) && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(room)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRoom(room.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>

                    <Link href={`/rooms/${room.id}`}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 group-hover:bg-blue-700 transition-colors">
                        <Car className="h-4 w-4 mr-2" />
                        Browse Cars
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {user?.role === 'admin' && filteredRooms.length > 0 && (
              <div className="text-center mt-8">
                <p className="text-gray-600 dark:text-gray-300 mb-4">You're viewing other showrooms.</p>
                <Link href="/admin">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Go to My Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}

        {/* Edit Room Dialog */}
        <Dialog open={isEditRoomDialogOpen} onOpenChange={setIsEditRoomDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Showroom</DialogTitle>
              <DialogDescription>
                Make changes to the showroom details here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  value={editRoomName}
                  onChange={(e) => setEditRoomName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea
                  id="description"
                  value={editRoomDescription}
                  onChange={(e) => setEditRoomDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Location</Label>
                <Input
                  id="location"
                  value={editRoomLocation}
                  onChange={(e) => setEditRoomLocation(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">Image URL</Label>
                <Input
                  id="image"
                  value={editRoomImage}
                  onChange={(e) => setEditRoomImage(e.target.value)}
                  className="col-span-3"
                />
              </div>
              {editRoomError && <p className="text-red-500 text-sm text-center">{editRoomError}</p>}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleSaveRoomEdit}
                disabled={isSavingRoom}
              >
                {isSavingRoom && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stats Section */}
        {filteredRooms.length > 0 && (
          <div className="mt-16 text-center">
            <div className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-50 rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {filteredRooms.length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Active Showrooms</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {filteredRooms.reduce((acc, room) => acc + 1, 0)}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Verified Dealers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    24/7
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Support Available</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}