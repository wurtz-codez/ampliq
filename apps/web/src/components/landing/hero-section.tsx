import { motion } from "framer-motion";
import { Mic, Music2, Sparkles } from "lucide-react";

export function HeroSection() {
	return (
		<section
			className="flex min-h-screen items-center justify-center px-6 pt-32 pb-20"
			id="home"
		>
			<div className="w-full max-w-6xl">
				<div className="space-y-8 text-center">
					{/* Floating Badge */}
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-2 backdrop-blur-sm"
						initial={{ opacity: 0, y: 20 }}
						transition={{ duration: 0.6 }}
					>
						<Sparkles className="h-4 w-4 text-primary" />
						<span className="text-muted-foreground text-sm">
							AI-Powered Music Mixing
						</span>
					</motion.div>

					{/* Main Headline */}
					<motion.h1
						animate={{ opacity: 1, y: 0 }}
						className="font-bold text-5xl leading-tight md:text-7xl"
						initial={{ opacity: 0, y: 20 }}
						transition={{ duration: 0.6, delay: 0.1 }}
					>
						Mix Music Like a DJ,
						<br />
						<span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
							Using Your Voice
						</span>
					</motion.h1>

					{/* Description */}
					<motion.p
						animate={{ opacity: 1, y: 0 }}
						className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl"
						initial={{ opacity: 0, y: 20 }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						Ampliq transforms musical instinct into seamless DJ transitions. Hum
						a melody, and AI finds the track, matches the tempo, and blends it
						perfectly.
					</motion.p>

					{/* CTA Buttons */}
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="flex flex-col items-center justify-center gap-4 sm:flex-row"
						initial={{ opacity: 0, y: 20 }}
						transition={{ duration: 0.6, delay: 0.3 }}
					>
						<motion.button
							className="group flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-primary-foreground"
							whileHover={{
								scale: 1.05,
								boxShadow: "0 0 30px rgba(192, 193, 255, 0.5)",
							}}
							whileTap={{ scale: 0.95 }}
						>
							<Mic className="h-5 w-5 group-hover:animate-pulse" />
							<span>Start Mixing</span>
						</motion.button>

						<motion.button
							className="rounded-full border border-border bg-card/40 px-8 py-4 text-foreground backdrop-blur-sm transition-colors hover:bg-card/60"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							Explore Features
						</motion.button>
					</motion.div>

					{/* Product Visual */}
					<motion.div
						animate={{ opacity: 1, scale: 1 }}
						className="relative mt-16"
						initial={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.8, delay: 0.4 }}
					>
						<div className="relative mx-auto max-w-4xl">
							{/* Glass Card Stack */}
							<div className="relative rounded-3xl border border-border bg-card/30 p-8 shadow-[0_20px_60px_rgba(192,193,255,0.2)] backdrop-blur-xl">
								{/* Waveform Visualization Mockup */}
								<div className="grid h-32 grid-cols-12 gap-2">
									{Array.from({ length: 48 }).map((_, i) => (
										<motion.div
											animate={{
												height: `${Math.random() * 100}%`,
											}}
											className="rounded-full bg-gradient-to-t from-primary/60 to-primary"
											initial={{ height: 0 }}
											key={i}
											transition={{
												duration: 0.5,
												delay: i * 0.02,
												repeat: Number.POSITIVE_INFINITY,
												repeatType: "reverse",
												repeatDelay: Math.random() * 2,
											}}
										/>
									))}
								</div>

								{/* EQ Mockup */}
								<div className="mt-8 flex items-center justify-center gap-6">
									<Music2 className="h-6 w-6 text-primary" />
									<div className="flex gap-2">
										{[60, 80, 70, 90, 75].map((height, i) => (
											<div className="flex flex-col items-center gap-2" key={i}>
												<div className="relative h-24 w-8 overflow-hidden rounded-full bg-card/50">
													<motion.div
														animate={{ height: `${height}%` }}
														className="absolute bottom-0 w-full rounded-full bg-gradient-to-t from-primary/80 to-primary"
													/>
												</div>
											</div>
										))}
									</div>
									<Music2 className="h-6 w-6 text-primary" />
								</div>
							</div>

							{/* Floating Elements */}
							<motion.div
								animate={{ y: [0, -10, 0] }}
								className="absolute -top-6 -left-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 backdrop-blur-sm"
								transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
							>
								<Mic className="h-8 w-8 text-primary" />
							</motion.div>

							<motion.div
								animate={{ y: [0, 10, 0] }}
								className="absolute -right-6 -bottom-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 backdrop-blur-sm"
								transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
							>
								<Music2 className="h-8 w-8 text-primary" />
							</motion.div>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
