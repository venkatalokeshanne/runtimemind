/**
 * NextAuth wrapper exports
 *
 * This file exposes `AuthProvider` (NextAuth `SessionProvider`) and a
 * small `useAuth` hook that mirrors the old `useAuth` shape used across
 * the codebase. It also re-exports `signIn` and `signOut` helpers.
 */
import { SessionProvider, signIn as nextSignIn, signOut as nextSignOut } from 'next-auth/react';
import { useUserContext } from './UserContext';

export const AuthProvider = SessionProvider;

export function useAuth() {
	const { user, session, loading } = useUserContext();

	return {
		user: user || null,
		session: session || null,
		loading: loading || false,
		signIn: nextSignIn,
		signOut: nextSignOut,
	};
}

export { nextSignIn as signIn, nextSignOut as signOut };
