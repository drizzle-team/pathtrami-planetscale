import { googleLogout } from '@react-oauth/google';
import axios from 'axios';
import { Credentials } from 'google-auth-library';
import { useEffect, useMemo, useState } from 'react';

export const apiClient = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_HOST,
});

apiClient.interceptors.request.use(async (config) => {
	if (config.headers?.['Authorization']) {
		return config;
	}

	let googleAuth = getGoogleAuth();
	if (!googleAuth) {
		return config;
	}

	if (googleAuth.expiry_date! <= Date.now()) {
		googleAuth = await apiClient
			.post<Credentials>('/auth/google/refresh-token', undefined, {
				headers: {
					Authorization: `Bearer ${googleAuth.refresh_token}`,
				},
			})
			.then(({ data }) => data)
			.catch((e) => {
				console.error(e);
				clearGoogleAuth();
				throw e;
			});

		setGoogleAuth(googleAuth);
	}

	if (!config.headers) {
		config.headers = {};
	}
	config.headers['Authorization'] = `Bearer ${googleAuth.id_token}`;

	return config;
});

export function getGoogleAuth(): Credentials | undefined {
	const googleAuthStr = localStorage.getItem('googleAuth');
	if (!googleAuthStr) {
		return undefined;
	}

	return JSON.parse(googleAuthStr);
}

export function setGoogleAuth(googleAuth: Credentials) {
	localStorage.setItem('googleAuth', JSON.stringify(googleAuth));
}

export function clearGoogleAuth() {
	localStorage.removeItem('googleAuth');
}

export default function useAuthenticated(): boolean {
	const [auth, setAuth] = useState(false);

	useEffect(() => {
		setAuth(isAuthenticated());
	}, []);

	return auth;
}

export function isAuthenticated(): boolean {
	return !!getGoogleAuth();
}

export function logout() {
	googleLogout();
	clearGoogleAuth();
}
