'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ENV_CONFIG } from '@/env.config';
import { io, Socket } from 'socket.io-client';
import RoomCreateModal from '@/components/RoomCreateModal';
import RoomDetailsModal from '@/components/RoomDetailsModal';
import AuthModal from '@/components/AuthModal';
import { Room } from '@/types/room';
import {
	ActiveRoomsBar,
	GameVideoSlider,
	GamesSection,
	HowItWorksSection,
	TechnologySection,
	ControllerFeaturesSection,
	KeyFeaturesSection,
	UseCasesSection,
	FinalCTASection,
	LandingFooter,
	GameInfo,
	CreateRoomData,
} from '@/components/landing';
import { AllGamesPreloader } from '@/components/GamePreloader';
import { ThemeLogo } from '@/components/ThemeLogo';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';

export default function Home() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [games, setGames] = useState<Record<string, GameInfo>>({});
	const [loading, setLoading] = useState(true);
	const { startLoading, stopLoading, isLoading: globalLoading } = useGlobalLoading();

	// Debug logging
	console.log('Home - local loading:', loading, 'global loading:', globalLoading);
	const [error, setError] = useState<string | null>(null);
	const [rooms, setRooms] = useState<Room[]>([]);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const socketRef = useRef<Socket | null>(null);



	// Load games list
	useEffect(() => {
		// Start global loading
		startLoading();
		
		const apiUrl = ENV_CONFIG.IS_PRODUCTION
			? `${window.location.protocol}//${window.location.host}/api/games`
			: `http://${ENV_CONFIG.BASE_URL}:${ENV_CONFIG.SERVER_PORT}/api/games`;

		fetch(apiUrl)
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
				return res.json();
			})
			.then((data) => {
				setGames(data || {});
				setLoading(false);
				stopLoading();
			})
			.catch((error) => {
				console.error('Error loading games:', error);
				setError(error.message);
				setLoading(false);
				stopLoading();
			});
	}, [startLoading, stopLoading]);

	// Socket connection for real-time room updates
	useEffect(() => {
		const socket = io(ENV_CONFIG.SERVER_URL, {
			transports: ['websocket', 'polling'],
			reconnection: true,
		});

		socketRef.current = socket;

		socket.on('connect', () => {
			console.log('[Home] Socket connected');
			socket.emit('rooms:list'); // Request current rooms list
		});

		socket.on('rooms:list', (roomsList: Room[]) => {
			console.log('[Home] Received rooms list:', roomsList);
			// Remove duplicates by id
			const uniqueRooms = Array.from(
				new Map(roomsList.map(room => [room.id, room])).values()
			);
			setRooms(uniqueRooms);
		});

		socket.on('rooms:updated', (updatedRooms: Room[]) => {
			console.log('[Home] Rooms updated:', updatedRooms);
			const uniqueRooms = Array.from(
				new Map(updatedRooms.map(room => [room.id, room])).values()
			);
			setRooms(uniqueRooms);
		});

		socket.on('room:created', (room: Room) => {
			console.log('[Home] Room created:', room);
			setRooms((prev) => {
				// Check if room already exists
				const exists = prev.some(r => r.id === room.id);
				if (exists) {
					console.log('[Home] Room already exists, skipping duplicate');
					return prev;
				}
				return [room, ...prev];
			});
		});

		socket.on('room:updated', (room: Room) => {
			console.log('[Home] Room updated:', room);
			setRooms((prev) => {
				const exists = prev.some(r => r.id === room.id);
				if (exists) {
					return prev.map((r) => (r.id === room.id ? room : r));
				}
				// If room doesn't exist, add it
				return [room, ...prev];
			});
		});

		socket.on('room:deleted', (roomId: string) => {
			console.log('[Home] Room deleted:', roomId);
			setRooms((prev) => prev.filter((r) => r.id !== roomId));
		});

		return () => {
			if (socket.connected) {
				socket.disconnect();
			}
		};
	}, [router]);

	const startGame = (gameType: string) => {
		const roomId = Math.random().toString(36).substring(2, 8);
		router.push(`/game/${gameType}?roomId=${roomId}`);
	};

	const handleCreateRoomClick = () => {
		// Check if user is authenticated
		if (status === 'unauthenticated') {
			console.log('[Home] User not authenticated, showing auth modal');
			setShowAuthModal(true);
			return;
		}
		setShowCreateModal(true);
	};

	const handleCreateRoom = (data: CreateRoomData) => {
		console.log('[Home] Creating room:', data);
		if (socketRef.current && session?.user) {
			// Listen for room creation confirmation
			socketRef.current.once('room:created', ({ roomId, gameInfo }: any) => {
				console.log('[Home] Room created, redirecting to game...', roomId);
				
				// If host participates, redirect to display page, otherwise to game screen
				if (data.hostParticipates) {
					router.push(`/game-display/${data.gameType}?roomId=${roomId}`);
				} else {
					router.push(`/game/${data.gameType}?roomId=${roomId}`);
				}
			});

			socketRef.current.emit('room:create', {
				...data,
				hostName: session.user.name || session.user.username || 'Host',
				userId: session.user.id,
			});
		}
	};

	const handleRoomClick = (room: Room) => {
		// Check if user is authenticated for joining
		if (status === 'unauthenticated') {
			console.log('[Home] User not authenticated, showing auth modal');
			setShowAuthModal(true);
			return;
		}
		
		// Show room details modal
		setSelectedRoom(room);
		setShowDetailsModal(true);
	};

	const handleJoinRoom = (roomId: string, password?: string) => {
		console.log('[Home] Joining room:', roomId, password ? 'with password' : '');
		router.push(`/game/${selectedRoom?.gameType}?roomId=${roomId}&mode=controller`);
	};

	const handleJoinRoomDirect = (room: Room) => {
		console.log('[Home] Joining room directly:', room.id);
		router.push(`/game/${room.gameType}?roomId=${room.id}&mode=controller`);
	};

	const handleAuthSuccess = () => {
		setShowAuthModal(false);
		console.log('[Home] Auth successful');
	};


	if (loading) {
		return (
			<div className="absolute min-h-screen	top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-primary to-lime-300 flex items-center justify-center">
				<div className="text-center">
					<div className="mb-8">
						<div className="relative">
							{/* Logo with animation */}
							<ThemeLogo 
								width={120} 
								height={78} 
								isLoading={true}
								loadingColor="#000000"
								loadedColor="#ffffff"
								className="relative z-10 logo-animated"
							/>
						</div>
					</div>
					<div className="text-black text-2xl font-medium animate-pulse">
						Loading games...
					</div>
					<style jsx>{`
						.logo-animated {
							filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.05));
							animation: logoFloat 3s ease-in-out infinite, logoGlow 2s ease-in-out infinite alternate;
						}
						@keyframes logoFloat {
							0%, 100% {
								transform: translateY(0px);
							}
							50% {
								transform: translateY(-10px);
							}
						}
						@keyframes logoGlow {
							0% {
								filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.05));
							}
							100% {
								filter: drop-shadow(0 0 30px rgba(55, 255, 0, 0.8)) drop-shadow(0 0 50px rgb(179, 255, 2));
							}
						}
						@keyframes spin-slow {
							from {
								transform: rotate(0deg);
							}
							to {
								transform: rotate(360deg);
							}
						}
						.animate-spin-slow {
							animation: spin-slow 8s linear infinite;
						}
					`}</style>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Preload game resources in background */}
			<AllGamesPreloader />
			
			{/* Active Rooms Bar
			<ActiveRoomsBar
				rooms={rooms}
				onCreateRoomClick={handleCreateRoomClick}
				onRoomClick={handleRoomClick}
				onJoinRoomDirect={handleJoinRoomDirect}
				expandedRoomId={null}
			/> */}

			{/* Modals */}
			<AuthModal
				isOpen={showAuthModal}
				onClose={() => setShowAuthModal(false)}
				onSuccess={handleAuthSuccess}
			/>
			<RoomCreateModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				onCreateRoom={handleCreateRoom}
			/>
			<RoomDetailsModal
				room={selectedRoom}
				isOpen={showDetailsModal}
				onClose={() => {
					setShowDetailsModal(false);
					setSelectedRoom(null);
				}}
				onJoin={handleJoinRoom}
			/>

			{/* Landing Page Sections */}
			<GameVideoSlider 
				games={games} 
				onCreateRoomClick={handleCreateRoomClick}
				onPlayGame={startGame}
			/>
			{/* <GamesSection games={games} startGame={startGame} /> */}
			
			<div className="max-w-7xl mx-auto px-4 py-20 space-y-24">
				<HowItWorksSection />
				<TechnologySection />
				<ControllerFeaturesSection />
				<KeyFeaturesSection />
				<UseCasesSection />
				<FinalCTASection />
				<LandingFooter />
			</div>
		</div>
	);
}

