import { supabase } from '@/lib/supabase/client';
import { supabaseFetch } from '@/lib/supabase/fetch';

export async function getProfile(userId) {
  if (!userId) return { data: null, error: { message: 'Missing user id' } };
  const endpoint = `profiles?select=*&id=eq.${encodeURIComponent(userId)}`;
  const { data, error } = await supabaseFetch(endpoint, { method: 'GET' });
  return { data: Array.isArray(data) ? data[0] || null : data, error };
}

export async function updateProfile(userId, profile) {
  if (!userId) return { data: null, error: { message: 'Missing user id' } };
  const endpoint = `profiles?id=eq.${encodeURIComponent(userId)}`;
  const { data, error } = await supabaseFetch(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(profile),
  });
  return { data, error };
}

export async function uploadAvatar(avatarFile, userId) {
  if (!avatarFile || !userId) return { url: null, error: { message: 'Missing file or user id' } };

  try {
    const fileExt = avatarFile.name?.split('.').pop() || 'jpg';
    const filePath = `avatars/${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage.from('avatars').upload(filePath, avatarFile, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) return { url: null, error };

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return { url: urlData?.publicUrl || null, error: null };
  } catch (err) {
    return { url: null, error: { message: err.message || 'Upload failed' } };
  }
}

export default { getProfile, updateProfile, uploadAvatar };
