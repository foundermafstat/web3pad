'use client';

import { useLoading } from '@/contexts/LoadingContext';
import { useCallback } from 'react';

/**
 * Hook for managing global loading state
 * Provides methods to control the global loading state
 */
export function useGlobalLoading() {
	const { isLoading, setLoading } = useLoading();

	const startLoading = useCallback(() => {
		console.log('useGlobalLoading - startLoading called');
		setLoading(true);
	}, [setLoading]);

	const stopLoading = useCallback(() => {
		console.log('useGlobalLoading - stopLoading called');
		setLoading(false);
	}, [setLoading]);

	return {
		isLoading,
		setLoading,
		startLoading,
		stopLoading,
	};
}
