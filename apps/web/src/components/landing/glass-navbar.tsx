"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, Music, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function GlassNavbar() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const [activeSection, setActiveSection] = useState("home");
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const scrollToSection = (sectionId: string) => {
		setActiveSection(sectionId);
		setMobileMenuOpen(false);

		if (window.location.pathname !== "/") {
			router.push(`/#${sectionId}`);
			return;
		}

		const element = document.getElementById(sectionId);
		element?.scrollIntoView({ behavior: "smooth" });
	};

	const handleAuthClick = () => {
		if (session) {
			router.push("/dashboard");
		} else {
			router.push("/login");
		}
	};

	return (
		<motion.nav
			animate={{ y: 0, opacity: 1 }}
			className="fixed top-6 left-1/2 z-50 w-[95%] max-w-5xl -translate-x-1/2"
			initial={{ y: -100, opacity: 0 }}
			transition={{ duration: 0.6 }}
		>
			<div className="relative rounded-full border border-border bg-card/40 px-6 py-3 shadow-[0_8px_32px_rgba(192,193,255,0.1)] backdrop-blur-xl">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<motion.div
						className="flex cursor-pointer items-center gap-2"
						onClick={() => scrollToSection("home")}
						whileHover={{ scale: 1.05 }}
					>
						<div className="relative">
							<div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
							<Music className="relative h-6 w-6 text-primary" />
						</div>
						<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text font-semibold text-lg text-transparent">
							Ampliq
						</span>
					</motion.div>

					{/* Nav Items */}
					<div className="hidden items-center gap-1 rounded-full bg-background/20 px-2 py-1 md:flex">
						{["home", "about", "contact"].map((item) => (
							<motion.button
								className="relative rounded-full px-6 py-2 text-sm capitalize transition-colors"
								key={item}
								onClick={() => scrollToSection(item)}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								{activeSection === item && (
									<motion.div
										className="absolute inset-0 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-sm"
										layoutId="activeTab"
										transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
									/>
								)}
								<span
									className={`relative z-10 ${
										activeSection === item
											? "text-primary"
											: "text-muted-foreground"
									}`}
								>
									{item}
								</span>
							</motion.button>
						))}
					</div>

					{/* CTA Button - Desktop */}
					<motion.button
						className="relative hidden overflow-hidden rounded-full bg-primary px-6 py-2 text-primary-foreground md:block"
						onClick={handleAuthClick}
						whileHover={{
							scale: 1.05,
							boxShadow: "0 0 20px rgba(192, 193, 255, 0.4)",
						}}
						whileTap={{ scale: 0.95 }}
					>
						<span className="relative z-10 flex items-center gap-2">
							{session ? (
								<>
									<User className="h-4 w-4" />
									{session.user.name.split(" ")[0]}
								</>
							) : (
								"Get Started"
							)}
						</span>
						<div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 transition-transform duration-1000 hover:translate-x-[100%]" />
					</motion.button>

					{/* Mobile Menu Button */}
					<motion.button
						className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 backdrop-blur-sm md:hidden"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						whileTap={{ scale: 0.95 }}
					>
						{mobileMenuOpen ? (
							<X className="h-5 w-5 text-primary" />
						) : (
							<Menu className="h-5 w-5 text-primary" />
						)}
					</motion.button>
				</div>

				{/* Mobile Menu */}
				<AnimatePresence>
					{mobileMenuOpen && (
						<motion.div
							animate={{ opacity: 1, height: "auto" }}
							className="mt-4 border-border/50 border-t pt-4 md:hidden"
							exit={{ opacity: 0, height: 0 }}
							initial={{ opacity: 0, height: 0 }}
						>
							<div className="flex flex-col gap-2">
								{["home", "about", "contact"].map((item) => (
									<motion.button
										className="rounded-xl px-4 py-3 text-left capitalize transition-colors hover:bg-primary/10"
										key={item}
										onClick={() => scrollToSection(item)}
										whileTap={{ scale: 0.98 }}
									>
										<span
											className={
												activeSection === item
													? "text-primary"
													: "text-muted-foreground"
											}
										>
											{item}
										</span>
									</motion.button>
								))}
								<motion.button
									className="mt-2 rounded-xl bg-primary px-4 py-3 text-primary-foreground"
									onClick={handleAuthClick}
									whileTap={{ scale: 0.98 }}
								>
									{session ? (
										<span className="flex items-center gap-2">
											<User className="h-4 w-4" />
											{session.user.name}
										</span>
									) : (
										"Get Started"
									)}
								</motion.button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.nav>
	);
}
