'use client';

import React from 'react';
import { Gamepad2, Plus } from 'lucide-react';
import { Room } from '@/types/room';
import RoomCard from '@/components/RoomCard';

interface ActiveRoomsBarProps {
	rooms: Room[];
	onCreateRoomClick: () => void;
	onRoomClick: (room: Room) => void;
	onJoinRoomDirect: (room: Room) => void;
	expandedRoomId: string | null;
}

export default function ActiveRoomsBar({ 
	rooms, 
	onCreateRoomClick, 
	onRoomClick, 
	onJoinRoomDirect,
	expandedRoomId 
}: ActiveRoomsBarProps) {
	return (
		<div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 shadow-xl">
			<div className="max-w-7xl mx-auto px-4 py-4">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center space-x-2">
						<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
						<h3 className="text-white font-bold">
							{rooms.length > 0 ? `Active Rooms (${rooms.length})` : 'No active rooms'}
						</h3>
					</div>
					<button
						onClick={onCreateRoomClick}
						className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl text-sm"
					>
						<Plus className="w-4 h-4" />
						<span>Create Room</span>
					</button>
				</div>
				
				{/* Rooms List - Always visible */}
				{rooms.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
						{rooms.map((room, index) => (
							<RoomCard 
								key={room.id || (room as any).roomId || `room-${index}`} 
								room={room} 
								onClick={() => onRoomClick(room)}
								isExpanded={expandedRoomId === room.id}
								onJoin={onJoinRoomDirect}
							/>
						))}
					</div>
				) : (
					<div className="text-center py-8 text-gray-400">
						<Gamepad2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
						<p>No rooms available. Create the first one!</p>
					</div>
				)}
			</div>
		</div>
	);
}
