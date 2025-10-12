'use client';

import React from 'react';
import { Users, Lock, Play, Clock } from 'lucide-react';
import { Room } from '../types/room';

interface RoomCardProps {
	room: Room;
	onClick: () => void;
}

const GAME_COLORS: Record<string, string> = {
	shooter: 'from-red-500/20 to-orange-500/20 border-red-500/30 hover:border-red-500/50',
	race: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-500/50',
	towerdefence: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-500/50',
	quiz: 'from-green-500/20 to-emerald-500/20 border-green-500/30 hover:border-green-500/50',
	gyrotest: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30 hover:border-indigo-500/50',
};

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

const RoomCard: React.FC<RoomCardProps> = ({ room, onClick }) => {
	const colorClass = GAME_COLORS[room.gameType] || 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
	const gameIcon = GAME_ICONS[room.gameType] || '🎮';
	const gameName = GAME_NAMES[room.gameType] || room.gameType;

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
				return 'Waiting';
			case 'playing':
				return 'In Game';
			case 'finished':
				return 'Finished';
			default:
				return 'Unknown';
		}
	};

	const getTimeAgo = () => {
		const now = Date.now();
		const diff = now - room.createdAt;
		const minutes = Math.floor(diff / 60000);
		
		if (minutes < 1) return 'Just now';
		if (minutes === 1) return '1 min ago';
		if (minutes < 60) return `${minutes} mins ago`;
		
		const hours = Math.floor(minutes / 60);
		if (hours === 1) return '1 hour ago';
		return `${hours} hours ago`;
	};

	return (
		<button
			onClick={onClick}
			className={`
				relative group
				min-w-[280px] max-w-[320px] 
				bg-gradient-to-br ${colorClass}
				backdrop-blur-sm
				border-2 rounded-2xl
				p-4
				transition-all duration-300
				hover:scale-105 hover:shadow-xl
				active:scale-95
				animate-in slide-in-from-left duration-300
			`}
		>
			{/* Status Badge */}
			<div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
				<div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
				<span className="text-xs font-medium text-white">{getStatusText()}</span>
			</div>

			{/* Lock Badge */}
			{room.hasPassword && (
				<div className="absolute top-3 left-3 bg-yellow-500/20 backdrop-blur-sm p-1.5 rounded-lg border border-yellow-500/30">
					<Lock className="w-3.5 h-3.5 text-yellow-400" />
				</div>
			)}

			{/* Content */}
			<div className="mt-8 space-y-3">
				{/* Game Icon & Name */}
				<div className="flex items-center space-x-3">
					<div className="text-4xl">{gameIcon}</div>
					<div className="flex-1 text-left">
						<div className="text-sm text-gray-400 font-medium">{gameName}</div>
						<div className="text-lg font-bold text-white truncate">{room.name}</div>
					</div>
				</div>

				{/* Stats */}
				<div className="flex items-center justify-between pt-2 border-t border-white/10">
					<div className="flex items-center space-x-2">
						<Users className="w-4 h-4 text-blue-400" />
						<span className="text-sm font-semibold text-white">
							{room.currentPlayers}/{room.maxPlayers}
						</span>
					</div>

					<div className="flex items-center space-x-2">
						<Clock className="w-3.5 h-3.5 text-gray-400" />
						<span className="text-xs text-gray-400">{getTimeAgo()}</span>
					</div>
				</div>

				{/* Host Info */}
				<div className="pt-2 border-t border-white/10">
					<div className="text-xs text-gray-400">
						Host: <span className="text-white font-medium">{room.hostName}</span>
					</div>
				</div>
			</div>

			{/* Hover Effect */}
			<div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/10 rounded-2xl transition-all duration-300 pointer-events-none" />
		</button>
	);
};

export default RoomCard;

