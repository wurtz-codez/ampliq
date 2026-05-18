"use client";

import { AboutSection } from "@/components/landing/about-section";
import { ContactSection } from "@/components/landing/contact-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { Footer } from "@/components/landing/footer";
import { GlassNavbar } from "@/components/landing/glass-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";

export default function Home() {
	return (
		<div className="min-h-screen overflow-x-hidden bg-background text-foreground">
			{/* Animated Background Elements */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute top-0 -left-20 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-[120px]" />
				<div
					className="absolute -right-20 bottom-0 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-[120px]"
					style={{ animationDelay: "1s" }}
				/>
				<div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[150px]" />
			</div>

			{/* Navigation */}
			<GlassNavbar />

			{/* Main Content */}
			<main>
				<HeroSection />
				<FeaturesSection />
				<HowItWorksSection />
				<AboutSection />
				<ContactSection />
			</main>

			{/* Footer */}
			<Footer />
		</div>
	);
}
