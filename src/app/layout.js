import "./globals.css";
import { Providers } from "./providers";
import { vazir, geistMono } from "./fonts";

export const metadata = {
  title: 'سیستم مدیریت محصولات پلاسکو - نسخه جدید ' + new Date().toLocaleTimeString(),
  description: 'سیستم مدیریت محصولات پلاسکو',
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=5.0",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={`h-full ${vazir.variable} ${geistMono.variable}`}>
      <body className="antialiased min-h-full text-sm sm:text-base">
        <Providers>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
