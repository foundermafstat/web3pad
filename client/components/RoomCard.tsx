'use client';

import React from 'react';
import { Users, Lock, Play, Clock } from 'lucide-react';
import { Room } from '../types/room';

interface RoomCardProps {
	room: Room;
	onClick: () => void;
	isExpanded?: boolean;
	onJoin?: (room: Room) => void;
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

const RoomCard: React.FC<RoomCardProps> = ({ room, onClick, isExpanded, onJoin }) => {
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
				return 'Open';
			case 'playing':
				return 'Playing';
			case 'finished':
				return 'Finished';
			default:
				return 'Unknown';
		}
	};

	return (
		<div className="w-full">
			<button
				onClick={onClick}
				className={`
					relative group w-full
					bg-card/80 backdrop-blur-sm
					border border-border/50 hover:border-primary/50
					rounded-lg p-3
					transition-all duration-200
					hover:shadow-md hover:bg-card
					${isExpanded ? 'rounded-b-none border-b-0' : ''}
				`}
			>
				<div className="flex items-center justify-between">
					{/* Left: Game Info */}
					<div className="flex items-center space-x-3 flex-1 min-w-0">
						<div className="text-2xl flex-shrink-0">{gameIcon}</div>
						<div className="flex-1 min-w-0 text-left">
							<div className="text-sm font-bold text-foreground truncate">{room.name}</div>
							<div className="text-xs text-muted-foreground">{gameName}</div>
						</div>
					</div>

					{/* Right: Status & Players */}
					<div className="flex items-center space-x-3 flex-shrink-0">
						{room.hasPassword && (
							<Lock className="w-3 h-3 text-yellow-500" />
						)}
						
						<div className="flex items-center space-x-1">
							<Users className="w-3 h-3 text-muted-foreground" />
							<span className="text-xs font-medium text-foreground">
								{room.currentPlayers}/{room.maxPlayers}
							</span>
						</div>

						<div className="flex items-center space-x-1">
							<div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
							<span className="text-xs text-muted-foreground">{getStatusText()}</span>
						</div>
					</div>
				</div>
			</button>

			{/* Expanded Details */}
			{isExpanded && (
				<div className="bg-card border border-t-0 border-border/50 rounded-b-lg p-4 space-y-3 shadow-lg">
					{/* Host Info */}
					<div className="flex items-center justify-between">
						<div className="text-sm">
							<span className="text-muted-foreground">Host:</span>
							<span className="text-foreground font-medium ml-1">{room.hostName}</span>
						</div>
						<div className="text-xs text-muted-foreground">
							ID: {room.id?.slice(-8)}
						</div>
					</div>

					{/* Players List */}
					{room.players && room.players.length > 0 && (
						<div>
							<div className="text-sm font-medium text-foreground mb-2">Connected Players:</div>
							<div className="space-y-1">
								{room.players.map((player, index) => (
									<div key={index} className="flex items-center space-x-2 text-sm">
										<div 
											className="w-2 h-2 rounded-full" 
											style={{ backgroundColor: player.color || '#6b7280' }}
										/>
										<span className="text-foreground">{player.name}</span>
										{player.isHost && (
											<span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
												Host
											</span>
										)}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex justify-end space-x-2 pt-2 border-t border-border/30">
						{room.status === 'waiting' ? (
							<button
								onClick={(e) => {
									e.stopPropagation();
									onJoin?.(room);
								}}
								className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
							>
								<Play className="w-3 h-3 mr-1 inline" />
								Join Game
							</button>
						) : (
							<button
								onClick={(e) => {
									e.stopPropagation();
									// Handle spectate logic here - could be added later
								}}
								className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/90 transition-colors"
								disabled={room.status === 'finished'}
							>
								{room.status === 'playing' ? 'Spectate' : 'Finished'}
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default RoomCard;

