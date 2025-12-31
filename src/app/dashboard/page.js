/**
 * ============================================================================
 * DASHBOARD OVERVIEW PAGE
 * ============================================================================
 * 
 * Main dashboard page with stats and recent activity.
 * 
 * ============================================================================
 */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Eye, PenSquare, TrendingUp, Layers, Bookmark, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/ui/button';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Posts', value: '0', icon: FileText, change: '+0 this month' },
    { label: 'Total Views', value: '0', icon: Eye, change: '+0 this week' },
    { label: 'Published', value: '0', icon: TrendingUp, change: '0 drafts' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ''}!
          </h1>
          <p className="text-text-secondary mt-1">
            Here's what's happening with your blog.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/new">
            <PenSquare className="w-4 h-4 mr-2" />
            Write new post
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface border border-border rounded-[var(--radius-lg)] p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-accent/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">{stat.label}</p>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                </div>
              </div>
              <p className="text-xs text-text-muted mt-4">{stat.change}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link 
            href="/dashboard/new"
            className="flex items-center gap-4 p-4 rounded-[var(--radius-md)] border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <PenSquare className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Write a new post</p>
              <p className="text-sm text-text-secondary">Share your thoughts with the world</p>
            </div>
          </Link>
          <Link 
            href="/dashboard/posts"
            className="flex items-center gap-4 p-4 rounded-[var(--radius-md)] border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Manage posts</p>
              <p className="text-sm text-text-secondary">View and edit your blog posts</p>
            </div>
          </Link>
          <Link 
            href="/dashboard/series"
            className="flex items-center gap-4 p-4 rounded-[var(--radius-md)] border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Manage series</p>
              <p className="text-sm text-text-secondary">Create and organize multi-part tutorials</p>
            </div>
          </Link>
          <Link 
            href="/dashboard/bookmarks"
            className="flex items-center gap-4 p-4 rounded-[var(--radius-md)] border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Reading list</p>
              <p className="text-sm text-text-secondary">View your saved articles</p>
            </div>
          </Link>
          <Link 
            href="/dashboard/followers"
            className="flex items-center gap-4 p-4 rounded-[var(--radius-md)] border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Followers</p>
              <p className="text-sm text-text-secondary">Manage your connections</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Recent Posts</h2>
          <Link 
            href="/dashboard/posts"
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            View all
          </Link>
        </div>
        
        {/* Empty State */}
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-text-muted mb-4" />
          <p className="text-text-secondary mb-4">
            You haven't written any posts yet.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard/new">Write your first post</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
