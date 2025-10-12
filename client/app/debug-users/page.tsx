'use client';

import { useEffect, useState } from 'react';

export default function DebugUsersPage() {
	const [users, setUsers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch('/api/debug/users')
			.then((res) => {
				console.log('Response status:', res.status);
				if (!res.ok) {
					throw new Error(`HTTP ${res.status}`);
				}
				return res.json();
			})
			.then((data) => {
				console.log('Users from DB:', data);
				console.log('Users array:', data.users);
				console.log('Count:', data.count);
				setUsers(data.users || []);
				setLoading(false);
			})
			.catch((err) => {
				console.error('Error fetching users:', err);
				setLoading(false);
			});
	}, []);

	if (loading) {
		return <div className="p-8">Loading...</div>;
	}

	return (
		<div className="container mx-auto p-8">
			<h1 className="text-2xl font-bold mb-4">Debug: Users in Database</h1>
			<div className="bg-card border border-border rounded-lg p-4">
				<p className="mb-4">Total users: {users.length}</p>
				<table className="w-full">
					<thead>
						<tr className="border-b">
							<th className="text-left p-2">ID</th>
							<th className="text-left p-2">Username</th>
							<th className="text-left p-2">Email</th>
							<th className="text-left p-2">Display Name</th>
						</tr>
					</thead>
					<tbody>
						{users.map((user) => (
							<tr key={user.id} className="border-b">
								<td className="p-2 font-mono text-xs">{user.id}</td>
								<td className="p-2 font-bold">{user.username}</td>
								<td className="p-2">{user.email}</td>
								<td className="p-2">{user.displayName}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

