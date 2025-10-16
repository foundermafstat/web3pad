'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Users, Clock, Target, ChevronLeft, ChevronRight, Gamepad2, Zap, Trophy, Sword, Puzzle, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameInfo } from './types';
import QRCodeDisplay from '@/components/QRCodeDisplay';

interface GameVideoSliderProps {
	games: Record<string, GameInfo>;
	onCreateRoomClick: () => void;
	onPlayGame: (gameType: string) => void;
}

interface GameSlideData {
	id: string;
	name: string;
	shortDescription: string;
	description: string;
	minPlayers: number;
	maxPlayers: number;
	icon: string;
	videoUrl: string;
	posterUrl: string;
	gradient: string;
	features: string[];
	playTime: string;
	duration: number;
	difficulty: string;
	category: string;
	controls: string[];
	gameMode: string;
	specialFeatures: string[];
}

interface SlideSettings {
	autoPlayDuration: number;
	transitionDuration: number;
	pauseOnHover: boolean;
	enableSwipeGestures: boolean;
	showProgressBar: boolean;
	showNavigationArrows: boolean;
	enableVideoAutoplay: boolean;
	fallbackToGradient: boolean;
}

export default function GameVideoSlider({ games, onCreateRoomClick, onPlayGame }: GameVideoSliderProps) {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [progress, setProgress] = useState(0);
	const [isPlaying, setIsPlaying] = useState(true);
	const [isHovered, setIsHovered] = useState(false);
	const [touchStart, setTouchStart] = useState(0);
	const [touchEnd, setTouchEnd] = useState(0);
	const [gameSlides, setGameSlides] = useState<GameSlideData[]>([]);
	const [settings, setSettings] = useState<SlideSettings | null>(null);
	const [loading, setLoading] = useState(true);
	const [isManuallyChanged, setIsManuallyChanged] = useState(false);
	const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const startTimeRef = useRef<number>(Date.now());

	// Function to get game icon based on game type
	const getGameIcon = (gameId: string) => {
		const iconMap: Record<string, React.ReactNode> = {
			'quiz': <Puzzle className="w-4 h-4" />,
			'race': <Car className="w-4 h-4" />,
			'shooter': <Target className="w-4 h-4" />,
			'tower-defence': <Sword className="w-4 h-4" />,
			'gyro-test': <Zap className="w-4 h-4" />,
			'default': <Gamepad2 className="w-4 h-4" />
		};
		return iconMap[gameId] || iconMap['default'];
	};
	
	const totalSlides = gameSlides.length;

	// Load slides data from JSON
	useEffect(() => {
		const loadSlidesData = async () => {
			try {
				const response = await fetch('/data/game-slides.json');
				const data = await response.json();
				setGameSlides(data.slides);
				setSettings(data.settings);
				setLoading(false);
			} catch (error) {
				console.error('Error loading slides data:', error);
				setLoading(false);
			}
		};

		loadSlidesData();
	}, []);

	// Initialize timer when slides are loaded
	useEffect(() => {
		if (gameSlides.length > 0) {
			startTimeRef.current = Date.now();
		}
	}, [gameSlides]);

	// Auto-advance slides with stable logic
	useEffect(() => {
		if (!isPlaying || isHovered || !settings || totalSlides === 0 || gameSlides.length === 0) return;

		// Clear any existing interval first
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		// Reset timer and progress
		startTimeRef.current = Date.now();
		if (isManuallyChanged) {
			setProgress(0);
			setIsManuallyChanged(false);
		}
		
		const updateProgress = () => {
			const currentSlideIndex = currentSlide;
			const currentSlideDuration = gameSlides[currentSlideIndex]?.duration || 10000;
			const elapsed = Date.now() - startTimeRef.current;
			const progressPercent = Math.min((elapsed / currentSlideDuration) * 100, 100);
			
			setProgress(progressPercent);
			
			if (progressPercent >= 100) {
				// Switch to next slide automatically
				const nextSlideIndex = (currentSlideIndex + 1) % totalSlides;
				setCurrentSlide(nextSlideIndex);
				startTimeRef.current = Date.now();
				setProgress(0);
			}
		};

		intervalRef.current = setInterval(updateProgress, 50);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [isPlaying, isHovered, settings, totalSlides, gameSlides, currentSlide, isManuallyChanged]);


	// Handle video playback with error prevention
	useEffect(() => {
		if (!settings?.enableVideoAutoplay || totalSlides === 0) return;

		videoRefs.current.forEach((video, index) => {
			if (video) {
				// Clear any existing promises to avoid AbortError
				video.onloadstart = null;
				
				if (index === currentSlide) {
					// Only play if not already playing
					if (video.paused) {
						video.currentTime = 0;
						const playPromise = video.play();
						if (playPromise !== undefined) {
							playPromise.catch((error) => {
								// Handle play() failures silently
								if (error.name !== 'AbortError') {
									console.warn('Video play failed:', error);
								}
							});
						}
					}
				} else {
					// Only pause if currently playing
					if (!video.paused) {
						video.pause();
					}
				}
			}
		});
	}, [currentSlide, settings?.enableVideoAutoplay, totalSlides]);

	const goToSlide = (slideIndex: number) => {
		setIsManuallyChanged(true);
		setCurrentSlide(slideIndex);
	};

	const nextSlide = () => {
		setIsManuallyChanged(true);
		setCurrentSlide((prev) => (prev + 1) % totalSlides);
	};

	const prevSlide = () => {
		setIsManuallyChanged(true);
		setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
	};

	const handlePlayGame = (gameId: string) => {
		onPlayGame(gameId);
	};

	// Generate game URL for QR code
	const generateGameUrl = (gameId: string) => {
		const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
		return `${baseUrl}/game?type=${gameId}`;
	};

	// Touch handlers for mobile swipe
	const minSwipeDistance = 50;

	const onTouchStart = (e: React.TouchEvent) => {
		setTouchEnd(0); // Clear touchEnd
		setTouchStart(e.targetTouches[0].clientX);
	};

	const onTouchMove = (e: React.TouchEvent) => {
		setTouchEnd(e.targetTouches[0].clientX);
	};

	const onTouchEnd = () => {
		if (!touchStart || !touchEnd) return;
		const distance = touchStart - touchEnd;
		const isLeftSwipe = distance > minSwipeDistance;
		const isRightSwipe = distance < -minSwipeDistance;

		if (isLeftSwipe) {
			setIsManuallyChanged(true);
			setCurrentSlide((prev) => (prev + 1) % totalSlides);
		} else if (isRightSwipe) {
			setIsManuallyChanged(true);
			setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
		}
	};

	const currentGameSlide = gameSlides[currentSlide];

	if (loading || !settings || totalSlides === 0) {
		return (
			<div className="w-full flex items-center justify-center bg-gradient-to-br from-lime-900 via-yellow-900 to-blue-900">
				<div className="text-center">
					<div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
					<div className="text-white text-2xl font-medium">
						Loading game slider...
					</div>
				</div>
			</div>
		);
	}

	return (
		<div 
			className="group w-full h-screen overflow-hidden"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onTouchStart={onTouchStart}
			onTouchMove={onTouchMove}
			onTouchEnd={onTouchEnd}
		>
			{/* Video Backgrounds */}
			{gameSlides.map((slide, index) => (
				<div
					key={slide.id}
					className={`absolute inset-0 transition-opacity duration-1000 ${
						index === currentSlide ? 'opacity-100' : 'opacity-0'
					}`}
				>
					{/* Background - Gradient Fallback */}
					<div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${slide.gradient.replace('/70', '').replace('/50', '').replace('/30', '')}`} />
					
					{/* Video Background (overlay on gradient) */}
					<video
						ref={(el) => { videoRefs.current[index] = el; }}
						className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000"
						muted
						loop
						playsInline
						onLoadedData={(e) => {
							(e.target as HTMLVideoElement).style.opacity = '1';
						}}
						onError={(e) => {
							// Keep gradient fallback visible if video fails
							(e.target as HTMLVideoElement).style.opacity = '0';
						}}
					>
						<source src={slide.videoUrl} type="video/mp4" />
					</video>
					
					{/* Animated Particles */}
					<div className="absolute inset-0 overflow-hidden z-5">
						{[...Array(8)].map((_, i) => (
							<div
								key={i}
								className="absolute w-2 h-2 bg-background/20 rounded-full animate-bounce"
								style={{
									left: `${Math.random() * 100}%`,
									top: `${Math.random() * 100}%`,
									animationDelay: `${Math.random() * 4}s`,
									animationDuration: `${3 + Math.random() * 2}s`,
								}}
							/>
						))}
						{[...Array(5)].map((_, i) => (
							<div
								key={`circle-${i}`}
								className="absolute border border-white/10 rounded-full animate-pulse"
								style={{
									left: `${Math.random() * 100}%`,
									top: `${Math.random() * 100}%`,
									width: `${50 + Math.random() * 100}px`,
									height: `${50 + Math.random() * 100}px`,
									animationDelay: `${Math.random() * 3}s`,
									animationDuration: `${4 + Math.random() * 2}s`,
								}}
							/>
						))}
					</div>

					{/* Darkening Gradient Overlay */}
					<div className="absolute inset-0 bg-gradient-to-tr from-background via-gray-800/50 to-transparent z-10" />
				</div>
			))}

			{/* Navigation Arrows */}
			<button
				onClick={prevSlide}
				className="absolute left-2 sm:left-6 top-1/2 transform -translate-y-1/2 z-30 bg-background/20 backdrop-blur-md text-white p-2 sm:p-3 rounded-full hover:bg-background/30 transition-all duration-300 opacity-60 sm:opacity-0 group-hover:opacity-100 touch-manipulation"
				aria-label="Previous slide"
			>
				<ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
			</button>
			<button
				onClick={nextSlide}
				className="absolute right-2 sm:right-6 top-1/2 transform -translate-y-1/2 z-30 bg-background/20 backdrop-blur-md text-white p-2 sm:p-3 rounded-full hover:bg-background/30 transition-all duration-300 opacity-60 sm:opacity-0 group-hover:opacity-100 touch-manipulation"
				aria-label="Next slide"
			>
				<ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
			</button>

			{/* Main Content */}
			<div className="relative z-20 h-full flex items-end justify-between">
				<div className="max-w-4xl px-6 sm:px-8 lg:px-28 pb-12 sm:pb-16 lg:pb-20 text-left">
					<div className="space-y-4 sm:space-y-6">
						{/* Game Icon and Title */}
						<div className="space-y-4 sm:space-y-6">
							
							
							<h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-6xl font-black text-white tracking-tight leading-tight">
								{currentGameSlide.name}
							</h1>
							
							<p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed">
								{currentGameSlide.description}
							</p>
						</div>

						{/* Game Stats */}
						<div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
							<Badge className="bg-background/20 backdrop-blur-md text-white border-white/30 px-2 py-1 text-xs">
								<Users className="w-3 h-3 mr-1" />
								<span className="hidden sm:inline">{currentGameSlide.minPlayers}-{currentGameSlide.maxPlayers} players</span>
								<span className="sm:hidden">{currentGameSlide.minPlayers}-{currentGameSlide.maxPlayers}</span>
							</Badge>
							<Badge className="bg-background/20 backdrop-blur-md text-white border-white/30 px-2 py-1 text-xs">
								<Clock className="w-3 h-3 mr-1" />
								{currentGameSlide.playTime}
							</Badge>
						</div>

						{/* Features */}
						<div className="flex flex-wrap gap-1.5 max-w-lg">
							{currentGameSlide.features.slice(0, 6).map((feature, index) => (
								<div 
									key={index}
									className="bg-background/5 border border-white/10 rounded-md px-2 py-1 text-white/80 text-xs font-medium"
								>
									{feature}
								</div>
							))}
						</div>

						{/* CTA Buttons */}
						<div className="space-y-4">
							<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
								<Button
									onClick={onCreateRoomClick}
									className="bg-background hover:bg-background/90 text-white py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-md hover:scale-105"
								>
									<Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
									Create Room
								</Button>
								<Button
									onClick={() => handlePlayGame(currentGameSlide.id)}
									variant="outline"
									className="border-white/50 text-white hover:bg-background/20 backdrop-blur-md py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg rounded-md hover:scale-105 transition-all duration-300"
								>
									<Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
									Quick Play
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* QR Code - Right side */}
				<div className="hidden lg:flex items-end pb-12 sm:pb-16 lg:pb-20 pr-6 sm:pr-8 lg:pr-28">
					<div className="bg-background/10 backdrop-blur-md rounded-lg p-4 shadow-2xl">
						<QRCodeDisplay 
							url={generateGameUrl(currentGameSlide.id)} 
							size={250}
						/>
						
					</div>
				</div>
			</div>

			{/* Slide Thumbnails */}
			<div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-sm sm:w-auto px-4">
				<div className="flex items-center justify-center space-x-2 sm:space-x-3 overflow-x-auto sm:overflow-visible">
					{gameSlides.map((slide, index) => (
						<button
							key={slide.id}
							onClick={() => goToSlide(index)}
							className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-300 flex-shrink-0 ${
								index === currentSlide
									? 'bg-background/20 text-white'
									: 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 hover:text-gray-200'
							}`}
						>
							<div className={index === currentSlide ? 'text-white' : 'text-gray-300'}>
								{getGameIcon(slide.id)}
							</div>
							<span className="text-xs sm:text-sm font-medium hidden lg:block">{slide.name}</span>
						</button>
					))}
				</div>
			</div>

		</div>
	);
}
