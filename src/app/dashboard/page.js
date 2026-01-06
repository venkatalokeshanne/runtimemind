/**
 * =============================================================================
 * DASHBOARD OVERVIEW PAGE
 * =============================================================================
 *
 * Server component wrapper that sets metadata and renders the client dashboard
 * experience.
 *
 * =============================================================================
 */

import { DashboardContent } from './components';

export const metadata = {
  title: 'Dashboard | RuntimeMind',
  description: 'View your recent posts, stats, and quick actions.',
};

export default function DashboardPage() {
  return <DashboardContent />;
}
