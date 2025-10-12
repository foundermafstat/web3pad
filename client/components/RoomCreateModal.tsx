'use client';

import React, { useState } from 'react';
import { X, Users, Lock, Unlock, Gamepad2 } from 'lucide-react';

interface RoomCreateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCreateRoom: (data: CreateRoomData) => void;
}

interface CreateRoomData {
	name: string;
	gameType: string;
	maxPlayers: number;
	password?: string;
}

const GAME_TYPES = [
	{ id: 'shooter', name: 'Battle Arena', icon: '🎯', color: 'from-red-500 to-orange-500' },
	{ id: 'race', name: 'Race Track', icon: '🏎️', color: 'from-blue-500 to-cyan-500' },
	{ id: 'towerdefence', name: 'Tower Defence', icon: '🏰', color: 'from-purple-500 to-pink-500' },
	{ id: 'quiz', name: 'Quiz Battle', icon: '🧠', color: 'from-green-500 to-emerald-500' },
	{ id: 'gyrotest', name: 'Gyro Test', icon: '📱', color: 'from-indigo-500 to-violet-500' },
];

const RoomCreateModal: React.FC<RoomCreateModalProps> = ({
	isOpen,
	onClose,
	onCreateRoom,
}) => {
	const [roomName, setRoomName] = useState('');
	const [selectedGame, setSelectedGame] = useState('');
	const [maxPlayers, setMaxPlayers] = useState(4);
	const [usePassword, setUsePassword] = useState(false);
	const [password, setPassword] = useState('');
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!roomName.trim()) {
			newErrors.roomName = 'Room name is required';
		} else if (roomName.length < 3) {
			newErrors.roomName = 'Room name must be at least 3 characters';
		} else if (roomName.length > 30) {
			newErrors.roomName = 'Room name must be less than 30 characters';
		}

		if (!selectedGame) {
			newErrors.gameType = 'Please select a game type';
		}

		if (maxPlayers < 2) {
			newErrors.maxPlayers = 'Minimum 2 players required';
		} else if (maxPlayers > 10) {
			newErrors.maxPlayers = 'Maximum 10 players allowed';
		}

		if (usePassword && !password.trim()) {
			newErrors.password = 'Password is required when enabled';
		} else if (usePassword && password.length < 4) {
			newErrors.password = 'Password must be at least 4 characters';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		const data: CreateRoomData = {
			name: roomName.trim(),
			gameType: selectedGame,
			maxPlayers,
			password: usePassword ? password : undefined,
		};

		onCreateRoom(data);
		handleClose();
	};

	const handleClose = () => {
		setRoomName('');
		setSelectedGame('');
		setMaxPlayers(4);
		setUsePassword(false);
		setPassword('');
		setErrors({});
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
			<div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl animate-in zoom-in-95 duration-200">
				{/* Header */}
				<div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between border-b border-gray-700 rounded-t-2xl">
					<div className="flex items-center space-x-3">
						<Gamepad2 className="w-6 h-6 text-white" />
						<h2 className="text-2xl font-bold text-white">Create Game Room</h2>
					</div>
					<button
						onClick={handleClose}
						className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Room Name */}
					<div>
						<label className="block text-sm font-semibold text-gray-300 mb-2">
							Room Name
						</label>
						<input
							type="text"
							value={roomName}
							onChange={(e) => setRoomName(e.target.value)}
							placeholder="Enter room name..."
							className={`w-full px-4 py-3 bg-gray-800/50 border ${
								errors.roomName ? 'border-red-500' : 'border-gray-700'
							} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
							maxLength={30}
						/>
						{errors.roomName && (
							<p className="text-red-400 text-sm mt-1">{errors.roomName}</p>
						)}
						<p className="text-gray-500 text-xs mt-1">
							{roomName.length}/30 characters
						</p>
					</div>

					{/* Game Type Selection */}
					<div>
						<label className="block text-sm font-semibold text-gray-300 mb-3">
							Game Type
						</label>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
							{GAME_TYPES.map((game) => (
								<button
									key={game.id}
									type="button"
									onClick={() => setSelectedGame(game.id)}
									className={`relative p-4 rounded-xl border-2 transition-all ${
										selectedGame === game.id
											? 'border-blue-500 bg-blue-500/10'
											: 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
									}`}
								>
									<div className="text-center">
										<div className="text-3xl mb-2">{game.icon}</div>
										<div className="text-sm font-medium text-white">
											{game.name}
										</div>
									</div>
									{selectedGame === game.id && (
										<div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
									)}
								</button>
							))}
						</div>
						{errors.gameType && (
							<p className="text-red-400 text-sm mt-2">{errors.gameType}</p>
						)}
					</div>

					{/* Max Players */}
					<div>
						<label className="block text-sm font-semibold text-gray-300 mb-2">
							Maximum Players
						</label>
						<div className="flex items-center space-x-4">
							<input
								type="range"
								min="2"
								max="10"
								value={maxPlayers}
								onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
								className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
							/>
							<div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700 min-w-[80px] justify-center">
								<Users className="w-4 h-4 text-blue-400" />
								<span className="text-white font-bold">{maxPlayers}</span>
							</div>
						</div>
						{errors.maxPlayers && (
							<p className="text-red-400 text-sm mt-1">{errors.maxPlayers}</p>
						)}
					</div>

					{/* Password Toggle */}
					<div>
						<label className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-all">
							<div className="flex items-center space-x-3">
								{usePassword ? (
									<Lock className="w-5 h-5 text-yellow-400" />
								) : (
									<Unlock className="w-5 h-5 text-gray-400" />
								)}
								<div>
									<div className="text-white font-medium">Password Protection</div>
									<div className="text-gray-400 text-sm">
										Require password to join
									</div>
								</div>
							</div>
							<input
								type="checkbox"
								checked={usePassword}
								onChange={(e) => setUsePassword(e.target.checked)}
								className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
							/>
						</label>

						{usePassword && (
							<div className="mt-3 animate-in slide-in-from-top-2 duration-200">
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Enter password..."
									className={`w-full px-4 py-3 bg-gray-800/50 border ${
										errors.password ? 'border-red-500' : 'border-gray-700'
									} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
								/>
								{errors.password && (
									<p className="text-red-400 text-sm mt-1">{errors.password}</p>
								)}
							</div>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex space-x-3 pt-4">
						<button
							type="button"
							onClick={handleClose}
							className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
						>
							Create Room
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default RoomCreateModal;

