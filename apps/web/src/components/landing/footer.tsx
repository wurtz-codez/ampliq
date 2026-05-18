import { Music } from "lucide-react";

export function Footer() {
	return (
		<footer className="border-border border-t px-6 py-12">
			<div className="mx-auto max-w-6xl">
				<div className="flex flex-col items-center justify-between gap-6 md:flex-row">
					{/* Logo & Tagline */}
					<div className="flex items-center gap-2">
						<Music className="h-6 w-6 text-primary" />
						<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text font-semibold text-lg text-transparent">
							Ampliq
						</span>
					</div>

					{/* Links */}
					<div className="flex gap-8 text-muted-foreground text-sm">
						<a className="transition-colors hover:text-primary" href="#home">
							Home
						</a>
						<a className="transition-colors hover:text-primary" href="#about">
							About
						</a>
						<a className="transition-colors hover:text-primary" href="#contact">
							Contact
						</a>
					</div>

					{/* Copyright */}
					<div className="text-muted-foreground text-sm">
						© 2026 Ampliq. All rights reserved.
					</div>
				</div>

				{/* Bottom Tagline */}
				<div className="mt-8 text-center text-muted-foreground text-sm">
					Amplify your musical instinct. EQ your creativity.
				</div>
			</div>
		</footer>
	);
}
