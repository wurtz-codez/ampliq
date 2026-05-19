import { auth } from "@ampliq/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import HomePage from "./home";

export default async function HomeRoute() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<div className="flex min-h-screen flex-col bg-[#13131b]">
			<HomePage session={session} />
		</div>
	);
}
