import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { GenerationProvider } from '@/lib/store/GenerationContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'StoryVision - AI 故事生成器',
  description: '上传图片，AI 帮你创作故事、漫画和短视频',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <GenerationProvider>
          {children}
        </GenerationProvider>
      </body>
    </html>
  );
}
