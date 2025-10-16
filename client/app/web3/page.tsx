'use client';

import { useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
	Zap,
	Shield,
	Users,
	Gamepad2,
	TrendingUp,
	Link as LinkIcon,
	CheckCircle,
	ArrowRight,
	Database,
	Globe,
	Lock,
	Star,
	Trophy,
	Coins,
	Layers,
	Activity,
	Smartphone,
	Server,
	Square,
	Code,
	Eye,
	ArrowUpRight,
	ExternalLink,
} from 'lucide-react';
import { ArchitectureDiagram } from '@/components/web3/ArchitectureDiagram';
import { BlockchainStats } from '@/components/web3/BlockchainStats';
import { TechMap } from '@/components/web3/TechMap';

export default function Web3Page() {
	const [activeFeature, setActiveFeature] = useState(0);

	const features = [
		{
			icon: Shield,
			title: 'Decentralized Results',
			description:
				'All game results are stored on the Stacks blockchain with cryptographic verification',
			color: 'text-blue-500',
		},
		{
			icon: Users,
			title: 'Player Ownership',
			description:
				'Players own their gaming data, achievements, and rewards through blockchain addresses',
			color: 'text-green-500',
		},
		{
			icon: Trophy,
			title: 'NFT Rewards',
			description:
				'Earn unique NFT achievements and collectibles that are truly yours',
			color: 'text-purple-500',
		},
		{
			icon: Coins,
			title: 'Token Economy',
			description:
				'Participate in the gaming economy with fungible tokens and rewards',
			color: 'text-yellow-500',
		},
	];

	const techStack = [
		{
<<<<<<< HEAD
			name: 'Stacks Blockchain',
			description: 'Bitcoin-secured smart contracts',
			icon: Square,
			status: 'Live',
=======
			name: "Stacks Blockchain",
			description: "Bitcoin-secured smart contracts",
			icon: Blocks,
			status: "Live"
>>>>>>> 826c74a8895a12c689f6dc54e41a93e4a97c44fc
		},
		{
			name: 'Clarity Smart Contracts',
			description: 'Decidable smart contract language',
			icon: Code,
			status: 'Deployed',
		},
		{
			name: 'SIP-009 NFTs',
			description: 'Standard NFT implementation',
			icon: Star,
			status: 'Compliant',
		},
		{
			name: 'SIP-010 FTs',
			description: 'Fungible token standard',
			icon: Coins,
			status: 'Compliant',
		},
	];

	const contracts = [
		{
			name: 'Registry Contract',
			address: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.registry',
			description: 'Central hub for game modules and asset management',
			features: [
				'Game Registration',
				'Asset Management',
				'Server Authorization',
			],
			lines: 687,
			cost: '0.188320 STX',
		},
		{
			name: 'Shooter Game Contract',
			address: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.shooter-game',
			description: 'Game-specific logic for Battle Arena',
			features: [
				'Session Management',
				'Result Verification',
				'NFT Progression',
			],
			lines: 614,
			cost: '0.178630 STX',
		},
		{
			name: 'NFT Trait',
			address: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.nft-trait',
			description: 'SIP-009 compliant NFT interface',
			features: [
				'Standard Operations',
				'Game Integration',
				'Metadata Management',
			],
			lines: 125,
			cost: '0.042250 STX',
		},
		{
			name: 'FT Trait',
			address: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.ft-trait',
			description: 'SIP-010 compliant token interface',
			features: ['Token Operations', 'Staking System', 'Reward Distribution'],
			lines: 154,
			cost: '0.050830 STX',
		},
	];

	const gameFlow = [
		{
			step: 1,
			title: 'Connect Wallet',
			description: 'Players connect their Stacks wallet to the platform',
			icon: LinkIcon,
		},
		{
			step: 2,
			title: 'Start Session',
			description: 'Game session is registered on the blockchain',
			icon: Gamepad2,
		},
		{
			step: 3,
			title: 'Play & Compete',
			description: 'Real-time gameplay with mobile controllers',
			icon: Smartphone,
		},
		{
			step: 4,
			title: 'Verify Results',
			description: 'Game results are cryptographically signed and verified',
			icon: Shield,
		},
		{
			step: 5,
			title: 'Earn Rewards',
			description: 'NFTs and tokens are distributed to winners',
			icon: Trophy,
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
			<div className="container mx-auto px-4 py-12">
				{/* Hero Section */}
				<div className="text-center mb-16">
					<div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
<<<<<<< HEAD
						<Square className="w-5 h-5 text-purple-400" />
						<span className="text-purple-300 text-sm font-medium">
							Blockchain-Powered Gaming
						</span>
=======
						<Blocks className="w-5 h-5 text-purple-400" />
						<span className="text-purple-300 text-sm font-medium">Blockchain-Powered Gaming</span>
>>>>>>> 826c74a8895a12c689f6dc54e41a93e4a97c44fc
					</div>

					<h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-6">
						Web3 Gaming
						<br />
						<span className="text-4xl md:text-5xl">Revolution</span>
					</h1>

					<p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
						Experience the future of gaming where every achievement, every
						victory, and every moment is permanently recorded on the blockchain.
						True ownership, verifiable results, and decentralized rewards.
					</p>

					<div className="flex flex-wrap justify-center gap-4">
						<Badge
							variant="outline"
							className="border-purple-500/30 text-purple-300 px-4 py-2"
						>
							<CheckCircle className="w-4 h-4 mr-2" />
							Live on Stacks Testnet
						</Badge>
						<Badge
							variant="outline"
							className="border-green-500/30 text-green-300 px-4 py-2"
						>
							<Shield className="w-4 h-4 mr-2" />
							Fully Decentralized
						</Badge>
						<Badge
							variant="outline"
							className="border-blue-500/30 text-blue-300 px-4 py-2"
						>
							<Users className="w-4 h-4 mr-2" />
							Player Owned Data
						</Badge>
					</div>
				</div>

				{/* Features Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
					{features.map((feature, index) => (
						<Card
							key={index}
							className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all duration-300 cursor-pointer"
							onClick={() => setActiveFeature(index)}
						>
							<CardContent className="p-6">
								<feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
								<h3 className="text-xl font-semibold text-white mb-2">
									{feature.title}
								</h3>
								<p className="text-gray-400 text-sm">{feature.description}</p>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Architecture Overview */}
				<Card className="bg-slate-800/50 border-slate-700 mb-16">
					<CardHeader>
						<CardTitle className="text-2xl text-white flex items-center gap-3">
							<Layers className="w-6 h-6 text-purple-400" />
							System Architecture
						</CardTitle>
						<CardDescription className="text-gray-400">
							How blockchain integration works in W3P platform
						</CardDescription>
					</CardHeader>
					<CardContent>
<<<<<<< HEAD
						<div className="grid lg:grid-cols-3 gap-8">
							{/* Client Layer */}
							<div className="space-y-4">
								<div className="flex items-center gap-2 mb-4">
									<Smartphone className="w-5 h-5 text-blue-400" />
									<h3 className="text-lg font-semibold text-white">
										Client Layer
									</h3>
								</div>
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm text-gray-300">
										<div className="w-2 h-2 bg-blue-400 rounded-full"></div>
										Mobile Controller Interface
									</div>
									<div className="flex items-center gap-2 text-sm text-gray-300">
										<div className="w-2 h-2 bg-blue-400 rounded-full"></div>
										Wallet Connection
									</div>
									<div className="flex items-center gap-2 text-sm text-gray-300">
										<div className="w-2 h-2 bg-blue-400 rounded-full"></div>
										Real-time Game Display
									</div>
								</div>
							</div>

							{/* Server Layer */}
							<div className="space-y-4">
								<div className="flex items-center gap-2 mb-4">
									<Server className="w-5 h-5 text-green-400" />
									<h3 className="text-lg font-semibold text-white">
										Server Layer
									</h3>
								</div>
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm text-gray-300">
										<div className="w-2 h-2 bg-green-400 rounded-full"></div>
										Game Logic Processing
									</div>
									<div className="flex items-center gap-2 text-sm text-gray-300">
										<div className="w-2 h-2 bg-green-400 rounded-full"></div>
										Result Verification
									</div>
									<div className="flex items-center gap-2 text-sm text-gray-300">
										<div className="w-2 h-2 bg-green-400 rounded-full"></div>
										Blockchain Integration
									</div>
								</div>
							</div>

							{/* Blockchain Layer */}
							<div className="space-y-4">
								<div className="flex items-center gap-2 mb-4">
									<Square className="w-5 h-5 text-purple-400" />
									<h3 className="text-lg font-semibold text-white">
										Blockchain Layer
									</h3>
								</div>
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm text-gray-300">
										<div className="w-2 h-2 bg-purple-400 rounded-full"></div>
										Stacks Smart Contracts
									</div>
									<div className="flex items-center gap-2 text-sm text-gray-300">
										<div className="w-2 h-2 bg-purple-400 rounded-full"></div>
										NFT & Token Management
									</div>
									<div className="flex items-center gap-2 text-sm text-gray-300">
										<div className="w-2 h-2 bg-purple-400 rounded-full"></div>
										Decentralized Storage
									</div>
								</div>
							</div>
						</div>
=======
						<ArchitectureDiagram />
>>>>>>> 826c74a8895a12c689f6dc54e41a93e4a97c44fc
					</CardContent>
				</Card>

				{/* Game Flow */}
				<Card className="bg-slate-800/50 border-slate-700 mb-16">
					<CardHeader>
						<CardTitle className="text-2xl text-white flex items-center gap-3">
							<Activity className="w-6 h-6 text-blue-400" />
							Gaming Flow
						</CardTitle>
						<CardDescription className="text-gray-400">
							From wallet connection to reward distribution
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-5 gap-6">
							{gameFlow.map((step, index) => (
								<div key={step.step} className="text-center">
									<div className="relative mb-4">
										<div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
											<step.icon className="w-8 h-8 text-white" />
										</div>
										{index < gameFlow.length - 1 && (
											<div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transform translate-x-4"></div>
										)}
									</div>
									<h3 className="text-lg font-semibold text-white mb-2">
										{step.title}
									</h3>
									<p className="text-sm text-gray-400">{step.description}</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Technology Map */}
				<Card className="bg-slate-800/50 border-slate-700 mb-16">
					<CardHeader>
						<CardTitle className="text-2xl text-white flex items-center gap-3">
							<Code className="w-6 h-6 text-green-400" />
							Technology Ecosystem
						</CardTitle>
						<CardDescription className="text-gray-400">
							Interactive map of our complete technology stack
						</CardDescription>
					</CardHeader>
					<CardContent>
<<<<<<< HEAD
						<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
							{techStack.map((tech, index) => (
								<Card key={index} className="bg-slate-900/50 border-slate-600">
									<CardContent className="p-6 text-center">
										<tech.icon className="w-12 h-12 text-green-400 mx-auto mb-4" />
										<h3 className="text-lg font-semibold text-white mb-2">
											{tech.name}
										</h3>
										<p className="text-sm text-gray-400 mb-3">
											{tech.description}
										</p>
										<Badge
											variant="outline"
											className="border-green-500/30 text-green-300"
										>
											{tech.status}
										</Badge>
									</CardContent>
								</Card>
							))}
						</div>
=======
						<TechMap />
>>>>>>> 826c74a8895a12c689f6dc54e41a93e4a97c44fc
					</CardContent>
				</Card>

				{/* Smart Contracts */}
				<Card className="bg-slate-800/50 border-slate-700 mb-16">
					<CardHeader>
						<CardTitle className="text-2xl text-white flex items-center gap-3">
							<Database className="w-6 h-6 text-purple-400" />
							Smart Contracts
						</CardTitle>
						<CardDescription className="text-gray-400">
							Deployed and verified on Stacks Testnet
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Tabs defaultValue="registry" className="w-full">
							<TabsList className="grid w-full grid-cols-4 bg-slate-900/50">
								<TabsTrigger value="registry">Registry</TabsTrigger>
								<TabsTrigger value="shooter">Shooter Game</TabsTrigger>
								<TabsTrigger value="nft">NFT Trait</TabsTrigger>
								<TabsTrigger value="ft">FT Trait</TabsTrigger>
							</TabsList>

							{contracts.map((contract, index) => (
								<TabsContent
									key={contract.name.toLowerCase().replace(' ', '-')}
									value={contract.name.toLowerCase().replace(' ', '-')}
									className="mt-6"
								>
									<Card className="bg-slate-900/50 border-slate-600">
										<CardHeader>
											<div className="flex items-center justify-between">
												<div>
													<CardTitle className="text-xl text-white">
														{contract.name}
													</CardTitle>
													<CardDescription className="text-gray-400 mt-1">
														{contract.description}
													</CardDescription>
												</div>
												<Badge
													variant="outline"
													className="border-green-500/30 text-green-300"
												>
													<CheckCircle className="w-3 h-3 mr-1" />
													Deployed
												</Badge>
											</div>
										</CardHeader>
										<CardContent>
											<div className="space-y-4">
												<div>
													<h4 className="text-sm font-medium text-gray-300 mb-2">
														Contract Address
													</h4>
													<div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
														<code className="text-sm text-blue-300 flex-1">
															{contract.address}
														</code>
														<Button
															size="sm"
															variant="ghost"
															className="text-blue-400 hover:text-blue-300"
														>
															<ExternalLink className="w-4 h-4" />
														</Button>
													</div>
												</div>

												<div className="grid md:grid-cols-2 gap-4">
													<div>
														<h4 className="text-sm font-medium text-gray-300 mb-2">
															Key Features
														</h4>
														<div className="space-y-1">
															{contract.features.map(
																(feature, featureIndex) => (
																	<div
																		key={featureIndex}
																		className="flex items-center gap-2 text-sm text-gray-400"
																	>
																		<CheckCircle className="w-3 h-3 text-green-400" />
																		{feature}
																	</div>
																)
															)}
														</div>
													</div>

													<div>
														<h4 className="text-sm font-medium text-gray-300 mb-2">
															Deployment Stats
														</h4>
														<div className="space-y-2">
															<div className="flex justify-between text-sm">
																<span className="text-gray-400">
																	Lines of Code:
																</span>
																<span className="text-white">
																	{contract.lines}
																</span>
															</div>
															<div className="flex justify-between text-sm">
																<span className="text-gray-400">
																	Deployment Cost:
																</span>
																<span className="text-white">
																	{contract.cost}
																</span>
															</div>
														</div>
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								</TabsContent>
							))}
						</Tabs>
					</CardContent>
				</Card>

				{/* Blockchain Statistics */}
				<Card className="bg-slate-800/50 border-slate-700 mb-16">
					<CardHeader>
						<CardTitle className="text-2xl text-white flex items-center gap-3">
							<Globe className="w-6 h-6 text-blue-400" />
							Blockchain Statistics
						</CardTitle>
						<CardDescription className="text-gray-400">
							Live deployment metrics and performance
						</CardDescription>
					</CardHeader>
					<CardContent>
						<BlockchainStats />
					</CardContent>
				</Card>

				{/* Call to Action */}
				<div className="text-center">
					<Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
						<CardContent className="p-12">
							<h2 className="text-3xl font-bold text-white mb-4">
								Ready to Experience Web3 Gaming?
							</h2>
							<p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
								Join the future of gaming where every achievement is yours
								forever. Connect your wallet and start earning real rewards.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Button
									size="lg"
									className="bg-purple-600 hover:bg-purple-700 text-white"
								>
									<Gamepad2 className="w-5 h-5 mr-2" />
									Start Playing
									<ArrowRight className="w-4 h-4 ml-2" />
								</Button>
								<Button
									size="lg"
									variant="outline"
									className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
								>
									<Eye className="w-5 h-5 mr-2" />
									View Contracts
									<ExternalLink className="w-4 h-4 ml-2" />
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
