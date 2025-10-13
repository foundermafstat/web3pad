'use client';

import React from 'react';
import { Target, Car, Castle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ControllerFeaturesSection() {
	return (
		<div className="max-w-7xl mx-auto px-4 py-20 space-y-12">
			<div className="text-center space-y-4">
				<h2 className="text-4xl font-bold text-white">
					Controller capabilities
				</h2>
				<p className="text-gray-300 text-lg max-w-2xl mx-auto">
					Each game has a unique control interface optimized for mobile
					devices
				</p>
			</div>

			<div className="grid md:grid-cols-3 gap-6">
				{/* Shooter Controller */}
				<Card className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-700/50 backdrop-blur-lg hover:scale-105 transition-all duration-300">
					<CardHeader>
						<Target className="w-12 h-12 text-red-400 mb-4" />
						<CardTitle className="text-xl text-white font-bold">
							Battle Arena
						</CardTitle>
						<CardDescription className="text-gray-300">
							Shooter controller
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-gray-300">
						<div className="flex items-center space-x-2">
							<CheckCircle2 className="w-4 h-4 text-green-400" />
							<span>Virtual joystick for movement</span>
						</div>
						<div className="flex items-center space-x-2">
							<CheckCircle2 className="w-4 h-4 text-green-400" />
							<span>Aiming joystick</span>
						</div>
						<div className="flex items-center space-x-2">
							<CheckCircle2 className="w-4 h-4 text-green-400" />
							<span>Fire button</span>
						</div>
						<div className="flex items-center space-x-2">
							<CheckCircle2 className="w-4 h-4 text-green-400" />
							<span>Real-time statistics</span>
						</div>
					</CardContent>
				</Card>

				{/* Race Controller */}
				<Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-700/50 backdrop-blur-lg hover:scale-105 transition-all duration-300">
					<CardHeader>
						<Car className="w-12 h-12 text-blue-400 mb-4" />
						<CardTitle className="text-xl text-white font-bold">
							Race Track
						</CardTitle>
						<CardDescription className="text-gray-300">
							Racing controller
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-gray-300">
						<div className="flex items-center space-x-2">
							<CheckCircle2 className="w-4 h-4 text-green-400" />
							<span>Gas and brake pedals</span>
						</div>
						<div className="flex items-center space-x-2">
							<CheckCircle2 className="w-4 h-4 text-green-400" />
							<span>Left/right turn buttons</span>
						</div>
						<div className="flex items-center space-x-2">
							<CheckCircle2 className="w-4 h-4 text-green-400" />
							<span>Speed indicator</span>
						</div>
						<div className="flex items-center space-x-2">
							<CheckCircle2 className="w-4 h-4 text-green-400" />
							<span>Leaderboard</span>
						</div>
					</CardContent>
				</Card>

				{/* Tower Defence Controller */}
				<Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-700/50 backdrop-blur-lg hover:scale-105 transition-all duration-300">
					<CardHeader>
						<Castle className="w-12 h-12 text-yellow-400 mb-4" />
						<CardTitle className="text-xl text-white font-bold">
							Tower Defence
						</CardTitle>
						<CardDescription className="text-gray-300">
							Strategic controller
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-gray-300">
						<div className="flex items-center space-x-2">
							<CheckCircle2 className="w-4 h-4 text-green-400" />
							<span>Tower type selection</span>
						</div>
						<div className="flex items-center space-x-2">
							<CheckCircle2 className="w-4 h-4 text-green-400" />
							<span>Tower upgrade and sale</span>
						</div>
						<div className="flex items-center space-x-2">
							<CheckCircle2 className="w-4 h-4 text-green-400" />
							<span>Wave management</span>
						</div>
						<div className="flex items-center space-x-2">
							<CheckCircle2 className="w-4 h-4 text-green-400" />
							<span>Resource statistics</span>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
