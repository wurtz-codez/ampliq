import { motion } from "framer-motion";
import { Mic2, Radio, Sliders, Zap } from "lucide-react";

const features = [
	{
		icon: Mic2,
		title: "Voice-Driven Mixing",
		description:
			"Hum, sing, or beatbox a melody. Ampliq instantly identifies the track and queues it up.",
	},
	{
		icon: Zap,
		title: "Instant BPM & Key Match",
		description:
			"AI analyzes tempo and musical key in real-time to ensure perfect harmonic blending.",
	},
	{
		icon: Radio,
		title: "Seamless Transitions",
		description:
			"Professional DJ-quality crossfades and beatmatching, no manual mixing required.",
	},
	{
		icon: Sliders,
		title: "Intuitive EQ Controls",
		description:
			"Fine-tune your mix with equalizer controls inspired by professional DJ setups.",
	},
];

export function FeaturesSection() {
	return (
		<section className="px-6 py-24">
			<div className="mx-auto max-w-6xl">
				{/* Section Header */}
				<motion.div
					className="mb-16 text-center"
					initial={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
					whileInView={{ opacity: 1, y: 0 }}
				>
					<h2 className="mb-4 font-bold text-4xl md:text-5xl">
						Built for{" "}
						<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
							Musical Instinct
						</span>
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
						Ampliq bridges the gap between what you hear in your head and what
						plays through the speakers.
					</p>
				</motion.div>

				{/* Features Grid */}
				<div className="grid gap-6 md:grid-cols-2">
					{features.map((feature, index) => (
						<motion.div
							className="group relative"
							initial={{ opacity: 0, y: 20 }}
							key={feature.title}
							transition={{ duration: 0.6, delay: index * 0.1 }}
							viewport={{ once: true }}
							whileHover={{ scale: 1.02, y: -5 }}
							whileInView={{ opacity: 1, y: 0 }}
						>
							<div className="relative h-full rounded-2xl border border-border bg-card/40 p-8 backdrop-blur-xl">
								{/* Glow Effect on Hover */}
								<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/5 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

								<div className="relative z-10">
									{/* Icon */}
									<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 backdrop-blur-sm transition-colors group-hover:bg-primary/20">
										<feature.icon className="h-7 w-7 text-primary" />
									</div>

									{/* Content */}
									<h3 className="mb-3 font-semibold text-xl">
										{feature.title}
									</h3>
									<p className="text-muted-foreground">{feature.description}</p>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
