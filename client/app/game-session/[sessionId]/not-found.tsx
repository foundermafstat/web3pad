import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';

export default function GameSessionNotFound() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="text-center max-w-md">
				<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
					<Gamepad2 className="w-10 h-10 text-muted-foreground" />
				</div>
				<h1 className="text-4xl font-bold mb-4">Игра не найдена</h1>
				<p className="text-muted-foreground mb-8">
					К сожалению, запрашиваемая игровая сессия не существует или была удалена.
				</p>
				<Link
					href="/"
					className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
				>
					Вернуться на главную
				</Link>
			</div>
		</div>
	);
}

