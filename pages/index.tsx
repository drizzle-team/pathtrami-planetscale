import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGoogleLogin } from '@react-oauth/google';
import { Credentials } from 'google-auth-library';
import type { NextPage } from 'next';
import Link from 'next/link';
import NProgress from 'nprogress';
import { useMutation, useQuery } from 'react-query';

import Button from '~/components/Button';
import Header from '~/components/Header';
import LocationCard from '~/components/LocationCard';
import { styled } from '~/stitches.config';
import useAuthenticated, { apiClient, logout, setGoogleAuth } from '~/utils/apiClient';
import { Place } from './api/places';

const Home: NextPage = () => {
	const isAuthenticated = useAuthenticated();

	const handleLogout = () => {
		logout();
		window.location.reload();
	};

	const googleLoginMutation = useMutation(async (code: string) => {
		return apiClient.post<Credentials>('/auth/google', {
			code,
		}).then(({ data }) => data);
	}, {
		onSuccess: (data) => {
			setGoogleAuth(data);
			window.location.reload();
		},
	});

	const login = useGoogleLogin({
		flow: 'auth-code',
		onSuccess: (response) => {
			googleLoginMutation.mutate(response.code);
		},
		onError: console.error,
	});

	const placesQuery = useQuery('places', async () => {
		NProgress.start();
		const { data } = await apiClient.get<Place[]>('/places');

		return data;
	}, {
		enabled: isAuthenticated,
		onSettled() {
			NProgress.done();
		},
	});

	return (
		<Root>
			<Header
				actions={
					<Link href='/new'>
						<a>
							<Button
								size='sm'
								icon={<FontAwesomeIcon icon={faPlus} />}
							>
								Add place
							</Button>
						</a>
					</Link>
				}
			/>

			{placesQuery.data && (
				<LocationCards>
					{placesQuery.data.map((place) => (
						<LocationCard
							key={place.slug}
							name={place.name}
							address={place.address}
							previewURL={place.previewURL}
							location={place.location}
							slug={place.slug}
						/>
					))}
				</LocationCards>
			)}

			{isAuthenticated
				? (
					<Button variant='secondary' style={{ marginTop: 50 }} onClick={handleLogout}>
						Log out
					</Button>
				)
				: <Button variant='primary' style={{ marginTop: 50 }} onClick={login}>Log in with Google</Button>}
		</Root>
	);
};

export default Home;

const Root = styled('div', {
	height: '100%',
	display: 'flex',
	flexFlow: 'column nowrap',
});

const LocationCards = styled('div', {
	display: 'flex',
	flexFlow: 'row nowrap',
	gap: 15,
	overflowY: 'auto',
});
