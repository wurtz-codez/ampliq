import { motion } from "framer-motion";
import { Mic, Music, Sparkles } from "lucide-react";

const steps = [
	{
		number: "01",
		icon: Mic,
		title: "Hum Your Idea",
		description:
			"A melody flashes through your mind. Capture it by humming, singing, or beatboxing into your device.",
	},
	{
		number: "02",
		icon: Sparkles,
		title: "AI Identifies & Analyzes",
		description:
			"Ampliq recognizes the song, retrieves the audio, and analyzes BPM, key, and structure in milliseconds.",
	},
	{
		number: "03",
		icon: Music,
		title: "Seamless Blend",
		description:
			"The new track fades in perfectly, matched and mixed like a professional DJ transition.",
	},
];

export function HowItWorksSection() {
	return (
		<section className="px-6 py-24">
			<div className="mx-auto max-w-6xl">
				{/* Section Header */}
				<motion.div
					className="mb-20 text-center"
					initial={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
					whileInView={{ opacity: 1, y: 0 }}
				>
					<h2 className="mb-4 font-bold text-4xl md:text-5xl">
						How It{" "}
						<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
							Works
						</span>
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
						From musical thought to mixed reality in three simple steps.
					</p>
				</motion.div>

				{/* Steps */}
				<div className="relative">
					{/* Connection Line */}
					<div className="absolute top-1/2 right-0 left-0 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent lg:block" />

					<div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
						{steps.map((step, index) => (
							<motion.div
								className="relative"
								initial={{ opacity: 0, y: 30 }}
								key={step.number}
								transition={{ duration: 0.6, delay: index * 0.2 }}
								viewport={{ once: true }}
								whileInView={{ opacity: 1, y: 0 }}
							>
								<div className="relative h-full rounded-2xl border border-border bg-card/40 p-8 backdrop-blur-xl">
									{/* Step Number */}
									<div className="absolute -top-4 left-8">
										<div className="rounded-full border border-primary/30 bg-primary/20 px-4 py-1 backdrop-blur-sm">
											<span className="font-semibold text-primary text-sm">
												{step.number}
											</span>
										</div>
									</div>

									{/* Icon */}
									<div className="mt-6 mb-6">
										<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 backdrop-blur-sm">
											<step.icon className="h-8 w-8 text-primary" />
										</div>
									</div>

									{/* Content */}
									<h3 className="mb-3 font-semibold text-xl">{step.title}</h3>
									<p className="text-muted-foreground">{step.description}</p>
								</div>

								{/* Arrow */}
								{index < steps.length - 1 && (
									<motion.div
										animate={{ x: [0, 5, 0] }}
										className="absolute top-1/2 -right-4 hidden -translate-y-1/2 text-primary/40 lg:block"
										transition={{
											duration: 2,
											repeat: Number.POSITIVE_INFINITY,
										}}
									>
										<svg
											aria-hidden="true"
											fill="none"
											height="24"
											stroke="currentColor"
											strokeWidth="2"
											viewBox="0 0 24 24"
											width="24"
										>
											<path d="M5 12h14M12 5l7 7-7 7" />
										</svg>
									</motion.div>
								)}
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
