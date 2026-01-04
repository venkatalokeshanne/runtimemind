"use client";

import React, { createContext, useContext, useMemo } from 'react';
import { useSession } from 'next-auth/react';

const UserContext = createContext({ user: null, session: null, loading: true });

export function UserProvider({ children, initialSession = null }) {
  // useSession is called only here (single place)
  const { data: sessionFromHook, status } = useSession();

  const session = sessionFromHook || initialSession || null;
  const value = useMemo(() => ({
    user: session?.user || null,
    session,
    loading: status === 'loading',
  }), [session, status]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  return useContext(UserContext);
}

export default UserContext;
