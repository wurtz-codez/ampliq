import { motion } from "framer-motion";
import { Mail, MessageSquare, Send } from "lucide-react";
import { useState } from "react";

export function ContactSection() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		message: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Form submitted:", formData);
		// Handle form submission
	};

	return (
		<section className="px-6 py-24" id="contact">
			<div className="mx-auto max-w-6xl">
				<div className="grid items-start gap-12 lg:grid-cols-2">
					{/* Left - Info */}
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						whileInView={{ opacity: 1, x: 0 }}
					>
						<h2 className="mb-6 font-bold text-4xl md:text-5xl">
							Let's{" "}
							<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
								Connect
							</span>
						</h2>
						<p className="mb-8 text-lg text-muted-foreground">
							Have questions about Ampliq? Want to join our beta? We'd love to
							hear from you.
						</p>

						{/* Contact Info Cards */}
						<div className="space-y-4">
							<motion.div
								className="flex items-center gap-4 rounded-2xl border border-border bg-card/40 p-6 backdrop-blur-xl"
								whileHover={{ scale: 1.02, x: 5 }}
							>
								<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 backdrop-blur-sm">
									<Mail className="h-6 w-6 text-primary" />
								</div>
								<div>
									<div className="text-muted-foreground text-sm">Email</div>
									<div className="font-semibold">hello@ampliq.ai</div>
								</div>
							</motion.div>

							<motion.div
								className="flex items-center gap-4 rounded-2xl border border-border bg-card/40 p-6 backdrop-blur-xl"
								whileHover={{ scale: 1.02, x: 5 }}
							>
								<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 backdrop-blur-sm">
									<MessageSquare className="h-6 w-6 text-primary" />
								</div>
								<div>
									<div className="text-muted-foreground text-sm">Support</div>
									<div className="font-semibold">support@ampliq.ai</div>
								</div>
							</motion.div>
						</div>
					</motion.div>

					{/* Right - Contact Form */}
					<motion.div
						initial={{ opacity: 0, x: 30 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						whileInView={{ opacity: 1, x: 0 }}
					>
						<div className="rounded-2xl border border-border bg-card/40 p-8 backdrop-blur-xl">
							<form className="space-y-6" onSubmit={handleSubmit}>
								<div>
									<label className="mb-2 block text-sm" htmlFor="name">
										Name
									</label>
									<input
										className="w-full rounded-xl border border-border bg-input-background px-4 py-3 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
										id="name"
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										placeholder="Your name"
										required
										type="text"
										value={formData.name}
									/>
								</div>

								<div>
									<label className="mb-2 block text-sm" htmlFor="email">
										Email
									</label>
									<input
										className="w-full rounded-xl border border-border bg-input-background px-4 py-3 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
										id="email"
										onChange={(e) =>
											setFormData({ ...formData, email: e.target.value })
										}
										placeholder="your@email.com"
										required
										type="email"
										value={formData.email}
									/>
								</div>

								<div>
									<label className="mb-2 block text-sm" htmlFor="message">
										Message
									</label>
									<textarea
										className="w-full resize-none rounded-xl border border-border bg-input-background px-4 py-3 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
										id="message"
										onChange={(e) =>
											setFormData({ ...formData, message: e.target.value })
										}
										placeholder="Tell us what you're thinking..."
										required
										rows={5}
										value={formData.message}
									/>
								</div>

								<motion.button
									className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-primary-foreground"
									type="submit"
									whileHover={{
										scale: 1.02,
										boxShadow: "0 0 30px rgba(192, 193, 255, 0.5)",
									}}
									whileTap={{ scale: 0.98 }}
								>
									<span>Send Message</span>
									<Send className="h-5 w-5 transition-transform group-hover:translate-x-1" />
								</motion.button>
							</form>
						</div>
					</motion.div>
				</div>

				{/* Final CTA */}
				<motion.div
					className="mt-24 text-center"
					initial={{ opacity: 0, y: 30 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
					whileInView={{ opacity: 1, y: 0 }}
				>
					<div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card/40 to-primary/5 p-12 backdrop-blur-xl">
						<h3 className="mb-4 font-bold text-3xl md:text-4xl">
							Ready to Transform Your Music Mixing?
						</h3>
						<p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
							Join the waitlist and be among the first to experience the future
							of intuitive music creation.
						</p>
						<motion.button
							className="rounded-full bg-primary px-10 py-4 text-primary-foreground"
							whileHover={{
								scale: 1.05,
								boxShadow: "0 0 40px rgba(192, 193, 255, 0.6)",
							}}
							whileTap={{ scale: 0.95 }}
						>
							Join the Beta
						</motion.button>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
