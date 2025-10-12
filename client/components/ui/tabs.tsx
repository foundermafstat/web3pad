'use client';

import * as React from 'react';

interface TabsContextValue {
	value: string;
	onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

interface TabsProps {
	value: string;
	onValueChange: (value: string) => void;
	children: React.ReactNode;
	className?: string;
}

export function Tabs({ value, onValueChange, children, className = '' }: TabsProps) {
	return (
		<TabsContext.Provider value={{ value, onValueChange }}>
			<div className={className}>{children}</div>
		</TabsContext.Provider>
	);
}

interface TabsListProps {
	children: React.ReactNode;
	className?: string;
}

export function TabsList({ children, className = '' }: TabsListProps) {
	return (
		<div
			className={`inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground ${className}`}
			role="tablist"
		>
			{children}
		</div>
	);
}

interface TabsTriggerProps {
	value: string;
	children: React.ReactNode;
	className?: string;
}

export function TabsTrigger({ value, children, className = '' }: TabsTriggerProps) {
	const context = React.useContext(TabsContext);
	if (!context) {
		throw new Error('TabsTrigger must be used within Tabs');
	}

	const isActive = context.value === value;

	return (
		<button
			type="button"
			role="tab"
			aria-selected={isActive}
			onClick={() => context.onValueChange(value)}
			className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
				isActive
					? 'bg-background text-foreground shadow-sm'
					: 'hover:bg-background/50 hover:text-foreground'
			} ${className}`}
		>
			{children}
		</button>
	);
}

interface TabsContentProps {
	value: string;
	children: React.ReactNode;
	className?: string;
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
	const context = React.useContext(TabsContext);
	if (!context) {
		throw new Error('TabsContent must be used within Tabs');
	}

	if (context.value !== value) {
		return null;
	}

	return (
		<div
			role="tabpanel"
			className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
		>
			{children}
		</div>
	);
}

