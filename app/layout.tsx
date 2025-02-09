import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Cloud Storage",
  description:
    "Securely upload, store and share your files with ease. Enjoy fast and reliable cloud storage designed for everyone.",
  keywords: [
    "cloud storage",
    "file sharing",
    "file upload",
    "secure storage",
    "online storage",
    "backup files",
    "share files",
    "file management",
  ],
  authors: [{ name: "Kevin" }],
  creator: "Kevin",
  publisher: "Cloud Storage",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Cloud Storage",
    description:
      "Securely upload, store and share your files with ease. Enjoy fast and reliable cloud storage designed for everyone.",
    url: "https://cloud-storage-v1.vercel.app/",
    siteName: "Cloud Storage",
    images: [
      {
        url: "https://cloud-storage-v1.vercel.app/assets/images/logo-icon.png",
        width: 200,
        height: 200,
        alt: "Cloud Storage Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  category: "File storage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-poppins antialiased`}>
        {children}
      </body>
    </html>
  );
}
