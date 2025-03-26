import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        userName: { label: "نام کاربری", type: "text" },
        password: { label: "رمز عبور", type: "password" }
      },
      async authorize(credentials) {
        // بررسی اعتبار کاربر
        if (credentials.userName === process.env.DEFAULT_USER_NAME && 
            credentials.password === process.env.DEFAULT_USER_PASSWORD) {
          return {
            id: "1",
            name: process.env.DEFAULT_USER_NAME,
            email: process.env.DEFAULT_USER_EMAIL,
            username: credentials.userName
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt",
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
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 