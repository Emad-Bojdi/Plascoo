import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Define default user credentials
const DEFAULT_USER = {
  id: '1',
  name: 'Admin',
  userName: 'Plasco',
  role: 'admin',
  // Password: admin123 (in a real application, this would be hashed)
  password: 'amin123'
};

// Define authOptions separately for reuse in other routes
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'ایمیل', type: 'email' },
        password: { label: 'رمز عبور', type: 'password' }
      },
      async authorize(credentials) {
        // Check if credentials match the default user
        if (
          credentials.email === DEFAULT_USER.email &&
          credentials.password === DEFAULT_USER.password
        ) {
          // Return user without the password
          return {
            id: DEFAULT_USER.id,
            name: DEFAULT_USER.name,
            email: DEFAULT_USER.email,
            role: DEFAULT_USER.role
          };
        }
        
        // If credentials don't match, return null (authentication failed)
        return null;
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 روز
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 