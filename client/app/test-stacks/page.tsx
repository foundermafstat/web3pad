import { StacksConnectTest } from '@/components/StacksConnectTest';

export default function TestStacksPage() {
	return (
		<div className="min-h-screen bg-background py-12">
			<div className="container mx-auto px-4">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold mb-4">Stacks Connect Test</h1>
					<p className="text-muted-foreground">
						Test the new @stacks/connect integration for wallet authentication
					</p>
				</div>
				<StacksConnectTest />
			</div>
		</div>
	);
}
