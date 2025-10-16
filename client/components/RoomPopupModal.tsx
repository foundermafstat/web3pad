'use client';

import React from 'react';
import { X, Users, Lock, Play, Gamepad2, Monitor, Clock } from 'lucide-react';
import { Room } from '@/types/room';

interface RoomPopupModalProps {
	room: Room | null;
	isOpen: boolean;
	onClose: () => void;
	onJoin: (room: Room) => void;
	triggerElement?: HTMLElement | null;
}

const GAME_ICONS: Record<string, string> = {
	shooter: '🎯',
	race: '🏎️',
	towerdefence: '🏰',
	quiz: '🧠',
	gyrotest: '📱',
};

const GAME_NAMES: Record<string, string> = {
	shooter: 'Battle Arena',
	race: 'Race Track',
	towerdefence: 'Tower Defence',
	quiz: 'Quiz Battle',
	gyrotest: 'Gyro Test',
};

const RoomPopupModal: React.FC<RoomPopupModalProps> = ({
	room,
	isOpen,
	onClose,
	onJoin,
	triggerElement,
}) => {
	if (!isOpen || !room) return null;

	const gameIcon = GAME_ICONS[room.gameType] || '🎮';
	const gameName = GAME_NAMES[room.gameType] || room.gameType;

	// Calculate position based on trigger element
	const getPopupPosition = () => {
		if (!triggerElement) {
			// Fallback to center if no trigger element
			return {
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
			};
		}

		const rect = triggerElement.getBoundingClientRect();
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

		// Position below the card with some offset
		const top = rect.bottom + scrollTop + 8; // 8px gap
		const left = rect.left + scrollLeft;

		// Ensure popup doesn't go off screen
		const popupWidth = 448; // max-w-md = 448px
		const popupHeight = 600; // estimated height
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;

		let finalLeft = left;
		let finalTop = top;

		// Adjust horizontal position if it goes off screen
		if (left + popupWidth > windowWidth) {
			finalLeft = windowWidth - popupWidth - 16; // 16px margin
		}

		// Adjust vertical position if it goes off screen
		if (top + popupHeight > windowHeight + scrollTop) {
			finalTop = rect.top + scrollTop - popupHeight - 8; // Show above instead
		}

		return {
			top: `${finalTop}px`,
			left: `${finalLeft}px`,
			transform: 'none',
		};
	};

	const popupStyle = getPopupPosition();

	const getStatusColor = () => {
		switch (room.status) {
			case 'waiting':
				return 'bg-green-500';
			case 'playing':
				return 'bg-yellow-500';
			case 'finished':
				return 'bg-gray-500';
			default:
				return 'bg-gray-500';
		}
	};

	const getStatusText = () => {
		switch (room.status) {
			case 'waiting':
				return 'Open';
			case 'playing':
				return 'Playing';
			case 'finished':
				return 'Finished';
			default:
				return 'Unknown';
		}
	};

	const formatTime = (timestamp: number) => {
		const now = Date.now();
		const diff = now - timestamp;
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);
		
		if (days > 0) {
			return `${days}d ${hours % 24}h ago`;
		} else if (hours > 0) {
			return `${hours}h ${minutes % 60}m ago`;
		} else if (minutes > 0) {
			return `${minutes}m ago`;
		} else {
			return 'Just now';
		}
	};

	const formatFullDate = (timestamp: number) => {
		const date = new Date(timestamp);
		return date.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	};

	return (
		<>
			{/* Backdrop */}
			<div 
				className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-in fade-in duration-200"
				onClick={onClose}
			/>
			
			{/* Popup positioned below the card */}
			<div 
				className="fixed z-50 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl animate-in slide-in-from-top-2 fade-in duration-200"
				style={popupStyle}
			>
				{/* Header */}
				<div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between border-b border-gray-700 rounded-t-2xl">
					<div className="flex items-center space-x-3">
						<div className="text-3xl">{gameIcon}</div>
						<div>
							<h2 className="text-xl font-bold text-white">{room.name}</h2>
							<p className="text-blue-100 text-sm">{gameName}</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				<div className="p-6 space-y-6">
					{/* Game Type & Room ID */}
					<div className="bg-gray-800/50 rounded-xl p-4">
						<div className="space-y-3">
							<div className="flex items-center space-x-3">
								<div className="text-3xl">{gameIcon}</div>
								<div>
									<div className="text-gray-400 text-sm">Game Type</div>
									<div className="text-white font-medium">{gameName}</div>
									<div className="text-gray-400 text-xs">{room.gameType}</div>
								</div>
							</div>
							
							<div className="pt-2 border-t border-gray-700">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<div className="text-gray-400 text-xs mb-1">Room ID</div>
										<div className="text-white font-mono text-sm">{room.id?.slice(-8) || 'N/A'}</div>
									</div>
									<div>
										<div className="text-gray-400 text-xs mb-1">Full ID</div>
										<div className="text-white font-mono text-xs">{room.id}</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Room Status & Created Time */}
					<div className="bg-gray-800/50 rounded-xl p-4">
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
									<span className="text-gray-300 font-medium">{getStatusText()}</span>
								</div>
								<div className="flex items-center space-x-1 text-gray-400 text-sm">
									<Clock className="w-4 h-4" />
									<span>{formatTime(room.createdAt)}</span>
								</div>
							</div>
							
							{/* Detailed Creation Time */}
							<div className="pt-2 border-t border-gray-700">
								<div className="text-gray-400 text-xs mb-1">Created</div>
								<div className="text-white text-sm">{formatFullDate(room.createdAt)}</div>
							</div>
						</div>
					</div>

					{/* Host Info */}
					<div className="bg-gray-800/50 rounded-xl p-4">
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<div>
									<div className="text-gray-400 text-sm">Host</div>
									<div className="text-white font-medium">{room.hostName}</div>
								</div>
								{room.hostParticipates && (
									<div className="flex items-center space-x-1 text-blue-400">
										<Gamepad2 className="w-4 h-4" />
										<span className="text-sm">Participates</span>
									</div>
								)}
							</div>
							
							{/* Host Account Info */}
							{room.hostUserId && (
								<div className="pt-2 border-t border-gray-700">
									<div className="text-gray-400 text-xs mb-1">User Account</div>
									<div className="flex items-center space-x-2">
										<div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
											<span className="text-white text-xs font-bold">
												{room.hostName.charAt(0).toUpperCase()}
											</span>
										</div>
										<div>
											<div className="text-white text-sm font-medium">{room.hostName}</div>
											<div className="text-gray-400 text-xs font-mono">
												ID: {room.hostUserId.slice(-8)}
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Players Info */}
					<div className="bg-gray-800/50 rounded-xl p-4">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center space-x-2">
								<Users className="w-5 h-5 text-green-400" />
								<span className="text-white font-medium">Players</span>
							</div>
							<div className="text-green-400 font-bold">
								{room.currentPlayers}/{room.maxPlayers}
							</div>
						</div>

						{/* Players List */}
						{room.players && room.players.length > 0 ? (
							<div className="space-y-2">
								{room.players.map((player, index) => (
									<div key={index} className="flex items-center space-x-3">
										<div 
											className="w-3 h-3 rounded-full" 
											style={{ backgroundColor: player.color || '#6b7280' }}
										/>
										<span className="text-gray-300 text-sm">{player.name}</span>
										{player.isHost && (
											<span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
												Host
											</span>
										)}
									</div>
								))}
							</div>
						) : (
							<div className="text-gray-400 text-sm">No players connected yet</div>
						)}
					</div>

					{/* Room Features */}
					<div className="flex flex-wrap gap-2">
						{room.hasPassword && (
							<div className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
								<Lock className="w-3 h-3" />
								<span>Password Protected</span>
							</div>
						)}
						{room.hostParticipates && (
							<div className="flex items-center space-x-1 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
								<Gamepad2 className="w-3 h-3" />
								<span>Host Plays</span>
							</div>
						)}
					</div>

					{/* Action Button */}
					<div className="pt-4">
						{room.status === 'waiting' ? (
							<button
								onClick={() => onJoin(room)}
								className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
							>
								<Play className="w-5 h-5" />
								<span>Join Game</span>
							</button>
						) : (
							<button
								className="w-full py-3 bg-gray-600 text-gray-300 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center space-x-2"
								disabled
							>
								<Monitor className="w-5 h-5" />
								<span>{room.status === 'playing' ? 'Game in Progress' : 'Game Finished'}</span>
							</button>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default RoomPopupModal;
