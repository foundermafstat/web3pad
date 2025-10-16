'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Users, Clock, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameInfo } from './types';

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
			className="group relative w-full h-[80vh] overflow-hidden"
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
					<div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${slide.gradient.replace('/90', '').replace('/80', '').replace('/70', '')}`} />
					
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
								className="absolute w-2 h-2 bg-white/20 rounded-full animate-bounce"
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
					<div className="absolute inset-0 bg-gradient-to-tr from-background via-gray-800/80 to-transparent z-10" />
				</div>
			))}

			{/* Navigation Arrows */}
			<button
				onClick={prevSlide}
				className="absolute left-2 sm:left-6 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 backdrop-blur-md text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300 opacity-60 sm:opacity-0 group-hover:opacity-100 touch-manipulation"
				aria-label="Previous slide"
			>
				<ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
			</button>
			<button
				onClick={nextSlide}
				className="absolute right-2 sm:right-6 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 backdrop-blur-md text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300 opacity-60 sm:opacity-0 group-hover:opacity-100 touch-manipulation"
				aria-label="Next slide"
			>
				<ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
			</button>

			{/* Main Content */}
			<div className="relative z-20 h-full flex items-end justify-start">
				<div className="max-w-4xl px-6 sm:px-8 lg:px-28 py-12 sm:py-16 lg:py-36 text-left">
					<div className="space-y-6 sm:space-y-8">
						{/* Game Icon and Title */}
						<div className="space-y-4 sm:space-y-6">
							
							
							<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
								{currentGameSlide.name}
							</h1>
							
							<p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed">
								{currentGameSlide.description}
							</p>
						</div>

						{/* Game Stats */}
						<div className="flex flex-wrap items-center gap-2 sm:gap-3">
							<Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 px-3 py-2 text-sm">
								<Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
								<span className="hidden sm:inline">{currentGameSlide.minPlayers}-{currentGameSlide.maxPlayers} players</span>
								<span className="sm:hidden">{currentGameSlide.minPlayers}-{currentGameSlide.maxPlayers}</span>
							</Badge>
							<Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 px-3 py-2 text-sm">
								<Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
								{currentGameSlide.playTime}
							</Badge>
						</div>

						{/* Features */}
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-w-lg">
							{currentGameSlide.features.slice(0, 6).map((feature, index) => (
								<div 
									key={index}
									className="bg-white/10 backdrop-blur-md border border-white/20 rounded-md p-2 sm:p-3 text-white text-xs sm:text-sm font-medium hover:bg-white/20 transition-all duration-300 text-center"
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
									className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-md hover:scale-105"
								>
									<Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
									Create Room
								</Button>
								<Button
									onClick={() => handlePlayGame(currentGameSlide.id)}
									variant="outline"
									className="border-white/50 text-white hover:bg-white/20 backdrop-blur-md font-bold py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg rounded-md"
								>
									<Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
									Quick Play
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Slide Thumbnails and Progress */}
			<div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-sm sm:w-auto px-4">
				<div className="flex items-center justify-center space-x-2 sm:space-x-4 bg-black/30 backdrop-blur-md rounded-md sm:rounded-2xl px-3 sm:px-6 py-3 sm:py-4 overflow-x-auto sm:overflow-visible">
					{gameSlides.map((slide, index) => (
						<button
							key={slide.id}
							onClick={() => goToSlide(index)}
							className={`relative flex items-center space-x-2 sm:space-x-3 px-2 sm:px-4 py-2 rounded-md sm:rounded-md transition-all duration-300 flex-shrink-0 ${
								index === currentSlide
									? 'bg-white/30 text-white scale-110'
									: 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
							}`}
						>
							<span className="text-base sm:text-lg">{slide.icon}</span>
							<span className="text-xs sm:text-sm font-medium hidden lg:block">{slide.name}</span>
							
							{/* Progress Bar for Active Slide */}
							{index === currentSlide && (
								<div className="absolute bottom-0 left-0 h-1 bg-white/20 rounded-full overflow-hidden w-full">
									<div 
										className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-100 ease-linear rounded-full"
										style={{ width: `${progress}%` }}
									/>
								</div>
							)}
						</button>
					))}
				</div>
			</div>

			{/* Play/Pause Control */}
			<div className="absolute top-4 sm:top-8 right-4 sm:right-8 z-30">
				<button
					onClick={() => setIsPlaying(!isPlaying)}
					className="bg-white/20 backdrop-blur-md text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300 touch-manipulation"
					aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
				>
					{isPlaying ? (
						<div className="w-3 h-3 sm:w-4 sm:h-4 flex space-x-1">
							<div className="w-1 h-3 sm:h-4 bg-white rounded-full" />
							<div className="w-1 h-3 sm:h-4 bg-white rounded-full" />
						</div>
					) : (
						<Play className="w-3 h-3 sm:w-4 sm:h-4" />
					)}
				</button>
			</div>
		</div>
	);
}
