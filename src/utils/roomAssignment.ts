import { supabase } from '../lib/supabase';

export async function assignRoomToRegistration(gender: string): Promise<string | null> {
  const { data: rooms, error } = await supabase
    .from('rooms')
    .select('id, room_number, gender, capacity')
    .in('gender', [gender, 'Co-ed'])
    .order('room_number');

  if (error) throw error;
  if (!rooms || rooms.length === 0) return null;

  for (const room of rooms) {
    const { count, error: countError } = await supabase
      .from('camp_registrations')
      .select('*', { count: 'exact' })
      .eq('room_id', room.id);

    if (countError) throw countError;

    const occupiedSpots = count || 0;
    if (occupiedSpots < room.capacity) {
      return room.id;
    }
  }

  return null;
}

export async function getRoomNumber(roomId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('room_number')
    .eq('id', roomId)
    .maybeSingle();

  if (error) throw error;
  return data?.room_number || null;
}
