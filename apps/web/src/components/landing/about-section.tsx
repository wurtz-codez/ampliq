import { motion } from "framer-motion";
import { Heart, Target, Zap } from "lucide-react";

export function AboutSection() {
	return (
		<section className="px-6 py-24" id="about">
			<div className="mx-auto max-w-6xl">
				<div className="grid items-center gap-12 lg:grid-cols-2">
					{/* Left Content */}
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						whileInView={{ opacity: 1, x: 0 }}
					>
						<h2 className="mb-6 font-bold text-4xl md:text-5xl">
							Music Mixing Powered by{" "}
							<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
								Intuition
							</span>
						</h2>
						<p className="mb-6 text-lg text-muted-foreground">
							Ampliq is an AI-powered music mixing platform that removes
							technical barriers between musical inspiration and creative
							expression.
						</p>
						<p className="mb-8 text-lg text-muted-foreground">
							We believe the best DJ moments come from instinct, not
							instruction. When a melody strikes you, Ampliq helps you act on it
							instantly—identifying tracks, matching tempos, and blending beats
							with professional precision.
						</p>

						{/* Stats or Quick Info */}
						<div className="grid grid-cols-3 gap-4">
							{[
								{ label: "AI-Powered", value: "100%" },
								{ label: "Avg Response", value: "<2s" },
								{ label: "Track Library", value: "50M+" },
							].map((stat, index) => (
								<motion.div
									className="rounded-xl border border-border bg-card/40 p-4 text-center backdrop-blur-xl"
									initial={{ opacity: 0, y: 20 }}
									key={stat.label}
									transition={{ duration: 0.6, delay: index * 0.1 }}
									viewport={{ once: true }}
									whileInView={{ opacity: 1, y: 0 }}
								>
									<div className="mb-1 font-bold text-2xl text-primary">
										{stat.value}
									</div>
									<div className="text-muted-foreground text-sm">
										{stat.label}
									</div>
								</motion.div>
							))}
						</div>
					</motion.div>

					{/* Right Content - Feature Cards */}
					<motion.div
						className="space-y-6"
						initial={{ opacity: 0, x: 30 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						whileInView={{ opacity: 1, x: 0 }}
					>
						{[
							{
								icon: Target,
								title: "The Problem We Solve",
								description:
									"Traditional DJ software requires years of practice. Ampliq makes expert mixing accessible to anyone with musical taste.",
							},
							{
								icon: Heart,
								title: "Our Mission",
								description:
									"Democratize music mixing by making it as natural as humming a tune. Everyone deserves to share their musical vision.",
							},
							{
								icon: Zap,
								title: "The Ampliq Difference",
								description:
									"We combine voice recognition, AI music analysis, and professional mixing algorithms into one seamless experience.",
							},
						].map((item, index) => (
							<motion.div
								className="rounded-2xl border border-border bg-card/40 p-6 backdrop-blur-xl"
								initial={{ opacity: 0, y: 20 }}
								key={item.title}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								viewport={{ once: true }}
								whileHover={{ scale: 1.02, x: 5 }}
								whileInView={{ opacity: 1, y: 0 }}
							>
								<div className="flex items-start gap-4">
									<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 backdrop-blur-sm">
										<item.icon className="h-6 w-6 text-primary" />
									</div>
									<div>
										<h3 className="mb-2 font-semibold text-lg">{item.title}</h3>
										<p className="text-muted-foreground">{item.description}</p>
									</div>
								</div>
							</motion.div>
						))}
					</motion.div>
				</div>
			</div>
		</section>
	);
}
