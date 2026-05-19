import { auth } from "@ampliq/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { GlassNavbar } from "@/components/landing/glass-navbar";

import HomePage from "./home";

export default async function HomeRoute() {
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
				<HomePage session={session} />
			</main>
		</div>
	);
}
