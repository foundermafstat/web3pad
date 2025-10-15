import { GamesGalleryView } from '@/components/games/GamesGalleryView';

export default function GamesPage() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold tracking-tight">Games</h1>
					<p className="text-muted-foreground mt-2">
						Discover exciting games controlled from your mobile device
					</p>
				</div>
				<GamesGalleryView />
			</div>
		</div>
	);
}

