'use client';

import React from 'react';
import { Sparkles, Users, Zap, Heart, Trophy, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function KeyFeaturesSection() {
	return (
		<div className="max-w-7xl mx-auto px-4 py-20 space-y-12">
			<div className="text-center space-y-4">
				<h2 className="text-4xl font-bold text-white">Why choose us?</h2>
				<p className="text-gray-300 text-lg max-w-2xl mx-auto">
					Technical advantages of the Web3Pad platform
				</p>
			</div>

			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				<Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg hover:bg-gray-800/70 transition-all">
					<CardHeader>
						<div className="bg-green-500/20 p-3 rounded-md w-fit mb-4">
							<Sparkles className="w-8 h-8 text-green-400" />
						</div>
						<CardTitle className="text-xl text-white font-bold">
							Zero installation
						</CardTitle>
					</CardHeader>
					<CardContent className="text-gray-300">
						Works right in the browser. No apps, no app stores, no
						permissions. Just open the link and play.
					</CardContent>
				</Card>

				<Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg hover:bg-gray-800/70 transition-all">
					<CardHeader>
						<div className="bg-blue-500/20 p-3 rounded-md w-fit mb-4">
							<Users className="w-8 h-8 text-blue-400" />
						</div>
						<CardTitle className="text-xl text-white font-bold">
							Up to 10 players
						</CardTitle>
					</CardHeader>
					<CardContent className="text-gray-300">
						Support for multiple players simultaneously. Each with unique
						color, name, and individual controller. Perfect for parties!
					</CardContent>
				</Card>

				<Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg hover:bg-gray-800/70 transition-all">
					<CardHeader>
						<div className="bg-purple-500/20 p-3 rounded-md w-fit mb-4">
							<Zap className="w-8 h-8 text-purple-400" />
						</div>
						<CardTitle className="text-xl text-white font-bold">
							Instant response
						</CardTitle>
					</CardHeader>
					<CardContent className="text-gray-300">
						Latency less than 20 milliseconds thanks to WebSocket and local
						network. Controls are as responsive as a real gamepad.
					</CardContent>
				</Card>

				<Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg hover:bg-gray-800/70 transition-all">
					<CardHeader>
						<div className="bg-cyan-500/20 p-3 rounded-md w-fit mb-4">
							<Heart className="w-8 h-8 text-cyan-400" />
						</div>
						<CardTitle className="text-xl text-white font-bold">
							Free
						</CardTitle>
					</CardHeader>
					<CardContent className="text-gray-300">
						Completely free platform. No subscriptions, no in-app purchases,
						no hidden fees. Just fun!
					</CardContent>
				</Card>

				<Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg hover:bg-gray-800/70 transition-all">
					<CardHeader>
						<div className="bg-pink-500/20 p-3 rounded-md w-fit mb-4">
							<Trophy className="w-8 h-8 text-pink-400" />
						</div>
						<CardTitle className="text-xl text-white font-bold">
							Different genres
						</CardTitle>
					</CardHeader>
					<CardContent className="text-gray-300">
						Shooters, racing, strategies—each game with unique mechanics and
						control style. New games are constantly being added!
					</CardContent>
				</Card>

				<Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg hover:bg-gray-800/70 transition-all">
					<CardHeader>
						<div className="bg-orange-500/20 p-3 rounded-md w-fit mb-4">
							<Shield className="w-8 h-8 text-orange-400" />
						</div>
						<CardTitle className="text-xl text-white font-bold">
							Privacy
						</CardTitle>
					</CardHeader>
					<CardContent className="text-gray-300">
						Games work in your local network. No data leaves your network.
						Full control over privacy.
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
