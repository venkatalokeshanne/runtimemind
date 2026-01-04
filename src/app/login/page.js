/**
 * ============================================================================
 * LOGIN PAGE
 * ============================================================================
 * 
 * Email/password login for authors.
 * Redirects to dashboard on successful login.
 * 
 * ============================================================================
 */

'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const passwordRef = useRef(null);
  const emailRef = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Read password from the uncontrolled input and immediately clear it from the DOM
    const rawPassword = passwordRef.current?.value || '';
    if (!rawPassword) {
      setError('Please enter your password.');
      setLoading(false);
      emailRef.current?.focus?.();
      return;
    }

    try {
      // NextAuth credentials signIn (we send the password once, then clear it)
      const result = await signIn('credentials', { redirect: false, email, password: rawPassword });

      // Clear the password input value as soon as we've handed it off
      try {
        if (passwordRef.current) passwordRef.current.value = '';
      } catch (e) {
        // ignore
      }

      // Normalize and present friendly errors
      if (!result) {
        setError('No response from authentication server. Please try again.');
        passwordRef.current?.focus?.();
        return;
      }

      if (result.error) {
        const raw = String(result.error || '').toLowerCase();
        let friendly = 'Sign in failed. Please try again.';

        if (raw.includes('invalid') || raw.includes('credentials')) {
          friendly = 'Invalid email or password.';
        } else if (raw.includes('request') || raw.includes('network')) {
          friendly = 'Network error. Check your connection and try again.';
        } else if (raw.includes('email')) {
          friendly = 'Please check your email address.';
        }

        setError(friendly);
        passwordRef.current?.focus?.();
        return;
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err) {
      console.error('Sign in error', err);
      setError('An unexpected error occurred. Please try again later.');
      passwordRef.current?.focus?.();
    } finally {
      setLoading(false);
    }

    // Redirect to dashboard on success
    router.push('/dashboard');
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
            Welcome back
          </h1>
          <p className="text-text-secondary">
            Sign in to your Runtimemind account
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-[var(--radius-md)] bg-error/10 border border-error/20 text-error text-sm">
                {error}
              </div>
            )}

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
                  ref={emailRef}
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="/forgot-password"
                  className="text-sm text-accent hover:text-accent-hover transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  ref={passwordRef}
                  className="pl-10"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

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
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
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

          {/* Sign Up Link */}
          <p className="text-center text-text-secondary">
            Don't have an account?{' '}
            <Link 
              href="/signup"
              className="text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
