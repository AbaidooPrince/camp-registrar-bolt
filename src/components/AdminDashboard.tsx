import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Plus, Trash2, Users, Home } from 'lucide-react';

interface Room {
  id: string;
  room_number: string;
  gender: string;
  capacity: number;
}

interface Registration {
  id: string;
  camper_name: string;
  age: number;
  gender: string;
  parent_email: string;
  room_id: string | null;
}

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [activeTab, setActiveTab] = useState<'rooms' | 'registrations'>('rooms');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newRoom, setNewRoom] = useState({ roomNumber: '', gender: 'Male', capacity: '' });
  const [isAddingRoom, setIsAddingRoom] = useState(false);

  useEffect(() => {
    loadRooms();
    loadRegistrations();
  }, []);

  const loadRooms = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number');

      if (fetchError) throw fetchError;
      setRooms(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('camp_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRegistrations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load registrations');
    }
  };

  const handleAddRoom = async (e: FormEvent) => {
    e.preventDefault();
    setIsAddingRoom(true);
    setError(null);

    try {
      if (!newRoom.roomNumber || !newRoom.capacity) {
        throw new Error('Please fill in all fields');
      }

      const { error: insertError } = await supabase
        .from('rooms')
        .insert([{
          room_number: newRoom.roomNumber,
          gender: newRoom.gender,
          capacity: parseInt(newRoom.capacity)
        }]);

      if (insertError) throw insertError;

      setNewRoom({ roomNumber: '', gender: 'Male', capacity: '' });
      loadRooms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add room');
    } finally {
      setIsAddingRoom(false);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      loadRooms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete room');
    }
  };

  const getRoomOccupancy = (roomId: string) => {
    return registrations.filter(r => r.room_id === roomId).length;
  };

  const getRoomCapacity = (roomId: string) => {
    return rooms.find(r => r.id === roomId)?.capacity || 0;
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Camp Admin Dashboard</h1>
            <p className="text-blue-100">Manage rooms and registrations</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'rooms'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Home className="w-5 h-5" />
            Rooms
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'registrations'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-5 h-5" />
            Registrations
          </button>
        </div>

        {activeTab === 'rooms' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-blue-50 p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Available Rooms</h2>
                </div>
                <div className="p-6">
                  {rooms.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No rooms added yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rooms.map((room) => (
                        <div
                          key={room.id}
                          className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-3xl font-bold text-blue-600">{room.room_number}</p>
                              <p className="text-sm text-gray-600">{room.gender}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                              Capacity: {getRoomOccupancy(room.id)}/{room.capacity}
                            </p>
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{
                                  width: `${(getRoomOccupancy(room.id) / room.capacity) * 100}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-blue-50 p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Room
                </h2>
              </div>
              <form onSubmit={handleAddRoom} className="p-6 space-y-4">
                <div>
                  <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    id="roomNumber"
                    value={newRoom.roomNumber}
                    onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                    placeholder="e.g., 101"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={newRoom.gender}
                    onChange={(e) => setNewRoom({ ...newRoom, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Co-ed">Co-ed</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                    placeholder="e.g., 4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAddingRoom}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isAddingRoom ? 'Adding...' : 'Add Room'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-50 p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Total Registrations: {registrations.length}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Camper Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Age</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Gender</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Parent Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No registrations yet.
                      </td>
                    </tr>
                  ) : (
                    registrations.map((reg) => {
                      const room = rooms.find(r => r.id === reg.room_id);
                      return (
                        <tr key={reg.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{reg.camper_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{reg.age}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{reg.gender}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{reg.parent_email}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-semibold text-blue-600">
                            {room ? room.room_number : 'Unassigned'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
