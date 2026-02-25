import type { Metadata } from "next";
import TopHeader from "@/app/components/sections/TopHeader";


export const metadata: Metadata = {
  title: "iimo - Sign in",
  description: "Sign in to iimo to manage your photo shoots, clients, and usage rights",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='pt-40 pb-20 px-4'>
        <TopHeader />
        {children}
    </div >
  );
}
