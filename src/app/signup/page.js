/**
 * ============================================================================
 * SIGNUP PAGE
 * ============================================================================
 * 
 * User registration with email/password.
 * Creates auth user and profile record.
 * 
 * ============================================================================
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';

export default function SignupPage() {
  const router = useRouter();
  // signUp handled via Supabase REST signup endpoint
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email,
          password,
          options: { data: { name } },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error_description || data?.message || 'Signup failed');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Check your email
            </h1>
            <p className="text-text-secondary mb-6">
              We've sent a confirmation link to <strong>{email}</strong>. 
              Click the link to activate your account.
            </p>
            <Button asChild variant="outline">
              <Link href="/login">Go to login</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Create your account
          </h1>
          <p className="text-text-secondary">
            Join Runtimemind and start writing
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-[var(--radius-md)] bg-error/10 border border-error/20 text-error text-sm">
                {error}
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>
              <p className="text-xs text-text-muted">
                Must be at least 8 characters
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-text-muted">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-accent hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-accent hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-text-muted">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Login Link */}
          <p className="text-center text-text-secondary">
            Already have an account?{' '}
            <Link 
              href="/login"
              className="text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
