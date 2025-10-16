'use client';

import Link from 'next/link';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import React from 'react';
import { 
	Info,
	Gamepad2,
	Trophy,
	Users,
	History,
	Target,
	Award,
	BarChart3,
	Smartphone,
	Settings,
	Zap,
	Globe,
	Crown,
	Medal,
	Star,
	Play,
	Layers
} from 'lucide-react';
import { ThemeLogo } from './ThemeLogo';

// Games for navigation
const games: { title: string; href: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
	{
		title: "Battle Arena",
		href: "/games/shooter",
		description: "Top-down multiplayer shooter. Fight bots and other players in real-time battles.",
		icon: Target,
	},
	{
		title: "Race Track", 
		href: "/games/race",
		description: "Competitive racing with obstacles. Control your car using device gyroscope.",
		icon: Zap,
	},
	{
		title: "Quiz Battle",
		href: "/games/quiz", 
		description: "Real-time trivia game with friends. Test your knowledge across categories.",
		icon: Award,
	},
	{
		title: "Tower Defence",
		href: "/games/towerdefence",
		description: "Strategic castle defense against waves of enemies. Build and upgrade towers.",
		icon: Trophy,
	},
	{
		title: "Gyro Test",
		href: "/games/gyrotest",
		description: "Test gyroscope and vibration features of your mobile device.",
		icon: Smartphone,
	},
];

function ListItem({
	title,
	children,
	href,
	icon: Icon,
	...props
}: React.ComponentPropsWithoutRef<"li"> & { 
	href: string; 
	icon?: React.ComponentType<{ className?: string }>; 
}) {
	return (
		<li {...props}>
			<NavigationMenuLink asChild>
				<Link 
					href={href}
					className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
				>
					<div className="text-sm leading-none font-medium flex items-center gap-2">
						{Icon && <Icon className="w-4 h-4" />}
						{title}
					</div>
					<p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
						{children}
					</p>
				</Link>
			</NavigationMenuLink>
		</li>
	);
}

export function DesktopNavigation() {
	return (
		<NavigationMenu className="hidden md:flex" viewport={false}>
			<NavigationMenuList>
				{/* About Project - Featured Layout */}
				<NavigationMenuItem>
					<NavigationMenuTrigger>About</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
							<li className="row-span-3">
								<NavigationMenuLink asChild>
									<Link
										className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none select-none focus:shadow-md"
										href="/about"
									>
										<div className="text-primary">
											<ThemeLogo width={60} height={39} />
										</div>
										
										<div className="mt-2 mb-2 text-lg font-medium">
											WEB3PAD
										</div>
										<p className="text-muted-foreground text-sm leading-tight">
											Revolutionary WEB3 gaming platform with mobile controller technology
										</p>
									</Link>
								</NavigationMenuLink>
							</li>
							<ListItem href="/about" title="WEB3 integration" icon={Info}>
								Collect NFTs, results are saved on the blockchain, play and earn rewards							
							</ListItem>
							<ListItem href="/about/controller" title="Controller Mechanics" icon={Smartphone}>
								How your smartphone transforms into a professional game controller. Control your game with your phone.
							</ListItem>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>

				{/* Games - Grid Layout */}
				<NavigationMenuItem>
					<NavigationMenuTrigger>Games</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
							{games.map((game) => (
								<ListItem
									key={game.title}
									title={game.title}
									href={game.href}
									icon={game.icon}
								>
									{game.description}
								</ListItem>
							))}
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>

				{/* Community - List Layout */}
				<NavigationMenuItem>
					<NavigationMenuTrigger>Community</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-[250px] gap-2">
							<li>
								<NavigationMenuLink asChild>
									<Link href="/leaderboard" className="flex gap-2 rounded-md hover:bg-accent">
										
										<div>
											<div className="flex">
												<Crown className="w-5 h-5 text-primary mr-2" />
												<div className="font-medium">Leaderboard</div>
											</div>
											
											<div className="text-muted-foreground text-sm">
												Game rankings and top players
											</div>
										</div>
									</Link>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<Link href="/players" className="flex gap-2 rounded-md hover:bg-accent">
										
										<div>
											<div className="flex">
												<Users className="w-5 h-5 text-primary mr-2" />
												<div className="font-medium">All Players</div>
											</div>
											<div className="text-muted-foreground text-sm">
												Browse community members
											</div>
										</div>
									</Link>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<Link href="/achievements" className="flex gap-2 rounded-md hover:bg-accent">
										
										<div>
											<div className="flex">
												<Medal className="w-5 h-5 text-primary mr-2" />
												<div className="font-medium">Achievements</div>
											</div>
											<div className="text-muted-foreground text-sm">
												Unlock rewards and badges
											</div>
										</div>
									</Link>
								</NavigationMenuLink>
							</li>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>

				{/* Stacks - Web3 Integration */}
				<NavigationMenuItem>
					<NavigationMenuLink asChild>
						<Link href="/stacks" className={navigationMenuTriggerStyle()}>
							<Layers className="w-4 h-4 mr-2" />
							Stacks
						</Link>
					</NavigationMenuLink>
				</NavigationMenuItem>

				{/* History - With Icons */}
				<NavigationMenuItem>
					<NavigationMenuTrigger>History</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-[200px] gap-2">
							<li>
								<NavigationMenuLink asChild>
									<Link href="/games/history" className="flex gap-2 rounded-md hover:bg-accent">
										<div>
											<div className="flex">
												<History className="w-5 h-5 text-primary mr-2" />
												<div className="font-medium">Game Sessions</div>
											</div>
											
											<div className="text-muted-foreground text-sm">
												View ended game sessions
											</div>
										</div>
										
									</Link>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<Link href="/profile" className="flex gap-2 rounded-md hover:bg-accent">
										<div>
											<div className="flex">
												<Star className="w-5 h-5 text-primary mr-2" />
												<div className="font-medium">Achievements</div>
											</div>
											
											<div className="text-muted-foreground text-sm">
												View all achievements in the community
											</div>
										</div>
									</Link>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink asChild>
									<Link href="/settings" className="flex gap-2 rounded-md hover:bg-accent">
										<div>
											<div className="flex">
												<Settings className="w-5 h-5 text-primary mr-2" />
												<div className="font-medium">Settings</div>
											</div>
											
											<div className="text-muted-foreground text-sm">
												View and change your settings
											</div>
										</div>
									</Link>
								</NavigationMenuLink>
							</li>				
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}
