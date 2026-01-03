import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

async function authorizeWithSupabase(credentials) {
  const { email, password } = credentials || {};
  if (!email || !password) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data?.access_token) {
      return null;
    }

    // data.user contains user object
    const user = data.user || null;

    return {
      id: user?.id,
      email: user?.email,
      name: (user?.user_metadata && (user.user_metadata.name || user.user_metadata.full_name)) || user?.email?.split('@')[0],
      image: user?.user_metadata?.avatar_url || null,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    };
  } catch (err) {
    console.error('Supabase authorize error', err);
    return null;
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        return await authorizeWithSupabase(credentials);
      },
    }),
  ],
  session: { strategy: 'jwt' },
  jwt: { maxAge: 30 * 24 * 60 * 60 },
  secret: NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // enrich user with profile from PostgREST if available
        let enriched = { ...user };
        try {
          const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=name,avatar_url,bio,website&id=eq.${encodeURIComponent(user.id)}`, {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${user.access_token}`,
            },
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (Array.isArray(profileData) && profileData.length > 0) {
              const p = profileData[0];
              enriched = {
                ...enriched,
                name: p.name || enriched.name,
                image: p.avatar_url || enriched.image,
                bio: p.bio || null,
                website: p.website || null,
              };
            }
          }
        } catch (e) {
          console.warn('Profile enrichment failed', e?.message || e);
        }

        token.user = enriched;
        token.access_token = user.access_token;
        token.expires_at = user.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user || session.user;
      session.accessToken = token.access_token;
      session.expires_at = token.expires_at;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
