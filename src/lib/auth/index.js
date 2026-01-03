/**
 * NextAuth wrapper exports
 *
 * This file exposes `AuthProvider` (NextAuth `SessionProvider`) and a
 * small `useAuth` hook that mirrors the old `useAuth` shape used across
 * the codebase. It also re-exports `signIn` and `signOut` helpers.
 */
import { SessionProvider, useSession, signIn as nextSignIn, signOut as nextSignOut } from 'next-auth/react';

export const AuthProvider = SessionProvider;

export function useAuth() {
	const { data: session, status } = useSession();

	return {
		user: session?.user || null,
		session: session || null,
		loading: status === 'loading',
		signIn: nextSignIn,
		signOut: nextSignOut,
	};
}

export { nextSignIn as signIn, nextSignOut as signOut };
