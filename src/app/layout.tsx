import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marching Band Manager',
  description: 'Design and manage marching band formations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F5F5] text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
