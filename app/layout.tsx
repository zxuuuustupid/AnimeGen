import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { GenerationProvider } from '@/lib/store/GenerationContext';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'StoryVision — AI 创意故事生成器',
  description: '上传一张图片，描述你的想法，AI 为你创作故事、生成漫画、制作短视频。由智谱 AI 驱动。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} font-sans antialiased`}>
        <GenerationProvider>
          {children}
        </GenerationProvider>
      </body>
    </html>
  );
}
