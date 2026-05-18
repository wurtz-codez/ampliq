"use client";
import type { auth } from "@ampliq/auth";
import { Button } from "@ampliq/ui/components/button";
import { useQuery } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export default function Dashboard({
	session,
}: {
	session: typeof auth.$Infer.Session;
}) {
	const router = useRouter();
	const privateData = useQuery(trpc.privateData.queryOptions());

	const handleSignOut = () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/");
				},
			},
		});
	};

	return (
		<div className="space-y-8">
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-2">
					<p className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
						User Information
					</p>
					<div className="space-y-1">
						<p className="font-semibold text-xl">{session.user.name}</p>
						<p className="text-muted-foreground">{session.user.email}</p>
					</div>
				</div>
				<div className="space-y-2">
					<p className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
						API Data
					</p>
					<div className="space-y-1">
						<p className="text-lg">
							{privateData.isLoading ? (
								<span className="animate-pulse opacity-50">Loading...</span>
							) : (
								privateData.data?.message
							)}
						</p>
					</div>
				</div>
			</div>

			<div className="border-border border-t pt-6">
				<Button
					className="h-11 rounded-xl px-6"
					onClick={handleSignOut}
					variant="destructive"
				>
					<LogOut className="mr-2 h-4 w-4" />
					Sign Out
				</Button>
			</div>
		</div>
	);
}
