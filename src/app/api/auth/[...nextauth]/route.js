import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Add some debugging to help troubleshoot
const DEFAULT_USER = process.env.DEFAULT_USER_NAME;
const DEFAULT_PASS = process.env.DEFAULT_USER_PASSWORD;
const AUTH_SECRET = process.env.NEXTAUTH_SECRET;

// Log environment variable status (will only show in server logs)
console.log('Auth environment check:', {
  hasUsername: !!DEFAULT_USER,
  hasPassword: !!DEFAULT_PASS,
  hasSecret: !!AUTH_SECRET,
  nodeEnv: process.env.NODE_ENV
});

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        userName: { label: "نام کاربری", type: "text" },
        password: { label: "رمز عبور", type: "password" }
      },
      async authorize(credentials) {
        // Add more detailed logging
        console.log('Auth attempt for user:', credentials.userName);
        
        // Check if environment variables are properly set
        if (!process.env.DEFAULT_USER_NAME || !process.env.DEFAULT_USER_PASSWORD) {
          console.error('Authentication environment variables are not set!');
          return null;
        }
        
        // بررسی اعتبار کاربر
        if (credentials.userName === process.env.DEFAULT_USER_NAME && 
            credentials.password === process.env.DEFAULT_USER_PASSWORD) {
          console.log('Authentication successful');
          return {
            id: "1",
            name: process.env.DEFAULT_USER_NAME,
            username: credentials.userName
          };
        }
        
        console.log('Authentication failed - invalid credentials');
        return null;
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.username = token.username;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debugging in all environments to troubleshoot
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };