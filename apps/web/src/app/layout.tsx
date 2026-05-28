import type { Metadata } from "next";
import {
	Geist,
	Geist_Mono,
	Inter,
	JetBrains_Mono,
	Sora,
} from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const sora = Sora({
	variable: "--font-sora",
	subsets: ["latin"],
});

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "ampliq",
	description: "ampliq",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link
					href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
			>
				<Providers>
					<div className="flex min-h-svh flex-col">{children}</div>
				</Providers>
			</body>
		</html>
	);
}
