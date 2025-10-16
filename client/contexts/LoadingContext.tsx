'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
	isLoading: boolean;
	setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
	const [isLoading, setIsLoading] = useState(false); // Start with loading false

	const setLoading = (loading: boolean) => {
		console.log('LoadingProvider - setLoading:', loading);
		setIsLoading(loading);
	};

	return (
		<LoadingContext.Provider value={{ isLoading, setLoading }}>
			{children}
		</LoadingContext.Provider>
	);
}

export function useLoading() {
	const context = useContext(LoadingContext);
	if (context === undefined) {
		throw new Error('useLoading must be used within a LoadingProvider');
	}
	return context;
}
