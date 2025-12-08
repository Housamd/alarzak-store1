import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Customer Login",
      credentials: {
        number: { label: "Customer number", type: "text" },
        code: { label: "Code", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.number || !credentials?.code) return null;

        // نحصل على المستخدم من قاعدة البيانات
        const customer = await prisma.customer.findUnique({
          where: { number: credentials.number },
        });

        if (!customer || !customer.isActive) return null;

        const valid = await bcrypt.compare(credentials.code, customer.codeHash);
        if (!valid) return null;

        // نرجع جميع القيم المهمة
        return {
          id: customer.id,
          email: customer.email || "",
          name: customer.name || "",
          role: "WHOLESALE", // افتراضيًا كل العملاء wholesale
          number: customer.number,
          isAdmin: customer.isAdmin || false,
        };
      },
    }),
  ],

  callbacks: {
    // 👇 يتحكم بمحتوى JWT
    async jwt({ token, user }) {
      // عند أول تسجيل دخول
      if (user) {
        (token as any).role = (user as any).role || "WHOLESALE";
        (token as any).number = (user as any).number;
        (token as any).isAdmin = (user as any).isAdmin || false;
      } else {
        // نحاول تحديث isAdmin من قاعدة البيانات عند كل تحميل
        const dbUser = await prisma.customer.findUnique({
          where: { number: (token as any).number },
          select: { isAdmin: true },
        });
        if (dbUser) (token as any).isAdmin = dbUser.isAdmin;
      }

      return token;
    },

    // 👇 يُرسل المعلومات إلى الـ session
    async session({ session, token }) {
      if (token) {
        (session.user as any).role = (token as any).role || "WHOLESALE";
        (session.user as any).number = (token as any).number || "";
        (session.user as any).isAdmin = (token as any).isAdmin || false;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};