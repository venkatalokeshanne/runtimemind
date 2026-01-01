/**
 * ============================================================================
 * USER SETTINGS PAGE
 * ============================================================================
 * 
 * Allows users to update their profile information.
 * 
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Globe, Linkedin, Twitter, Camera, Loader2, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Label } from '@/ui/label';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshSession } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    website: '',
    twitter: '',
    linkedin: '',
  });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load user profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, bio, avatar_url, website, twitter, linkedin')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading profile:', error);
          setMessage({ type: 'error', text: 'Failed to load profile' });
          return;
        }

        if (data) {
          setFormData({
            name: data.name || '',
            bio: data.bio || '',
            website: data.website || '',
            twitter: data.twitter || '',
            linkedin: data.linkedin || '',
          });
          setAvatarUrl(data.avatar_url);
        }
      } catch (err) {
        console.error('Error:', err);
        setMessage({ type: 'error', text: 'Something went wrong' });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 2MB' });
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setMessage({ type: '', text: '' });
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !user?.id) return null;

    setUploadingAvatar(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setMessage({ type: 'error', text: 'Failed to upload avatar' });
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Upload avatar if changed
      let newAvatarUrl = avatarUrl;
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          newAvatarUrl = uploadedUrl;
        }
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: formData.name || user.email?.split('@')[0] || 'User',
          bio: formData.bio || null,
          avatar_url: newAvatarUrl,
          website: formData.website || null,
          twitter: formData.twitter || null,
          linkedin: formData.linkedin || null,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Update error:', error);
        setMessage({ type: 'error', text: 'Failed to update profile' });
        return;
      }

      // Refresh auth session to update user data
      await refreshSession();
      
      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);
      setAvatarPreview(null);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      console.error('Error:', err);
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayAvatar = avatarPreview || avatarUrl;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-2">Manage your profile and account settings</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {message.type === 'success' ? (
            <Check className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Section */}
        <section className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center text-2xl font-bold text-white">
                  {(formData.name || user.email?.split('@')[0] || 'U').slice(0, 1).toUpperCase()}
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-2 bg-surface border border-border rounded-full cursor-pointer hover:bg-hover transition-colors shadow-sm">
                <Camera className="w-4 h-4 text-text-secondary" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="sr-only"
                />
              </label>
            </div>
            <div className="text-sm text-text-secondary">
              <p>Upload a profile picture</p>
              <p className="text-text-muted mt-1">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>
        </section>

        {/* Basic Info Section */}
        <section className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us a little about yourself..."
                rows={3}
                className="mt-1.5"
              />
              <p className="text-xs text-text-muted mt-1.5">
                This will be displayed on your author profile.
              </p>
            </div>
          </div>
        </section>

        {/* Social Links Section */}
        <section className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Social Links</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-text-muted" />
                Website
              </Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="twitter" className="flex items-center gap-2">
                <Twitter className="w-4 h-4 text-text-muted" />
                Twitter
              </Label>
              <Input
                id="twitter"
                name="twitter"
                type="text"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="@username or https://twitter.com/username"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-text-muted" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                name="linkedin"
                type="text"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="username or https://linkedin.com/in/username"
                className="mt-1.5"
              />
            </div>
          </div>
        </section>

        {/* Account Info (Read-only) */}
        <section className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-text-muted">Email</Label>
              <p className="text-text-primary mt-1">{user.email}</p>
              <p className="text-xs text-text-muted mt-1">
                Contact support to change your email address.
              </p>
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving || uploadingAvatar}
          >
            {saving || uploadingAvatar ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
