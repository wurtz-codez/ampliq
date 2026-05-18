import { auth } from "@ampliq/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { GlassNavbar } from "@/components/landing/glass-navbar";

import Dashboard from "./dashboard";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<GlassNavbar />
			<main className="container mx-auto px-6 pt-32 pb-20">
				<div className="space-y-6">
					<div>
						<h1 className="font-bold text-4xl">Dashboard</h1>
						<p className="text-lg text-muted-foreground">
							Welcome back, {session.user.name}
						</p>
					</div>
					<div className="rounded-3xl border border-border bg-card/40 p-8 backdrop-blur-xl">
						<Dashboard session={session} />
					</div>
				</div>
			</main>
		</div>
	);
}
