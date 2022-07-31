import { faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faMapLocationDot, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGoogleLogin } from '@react-oauth/google';
import { Credentials } from 'google-auth-library';
import type { NextPage } from 'next';
import Link from 'next/link';
import NProgress from 'nprogress';
import { useMutation, useQuery } from 'react-query';

import Button from '~/components/Button';
import Header from '~/components/Header';
import LocationCard, { LocationCardPlaceholder } from '~/components/LocationCard';
import { styled, theme } from '~/stitches.config';
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

			{isAuthenticated && placesQuery.status !== 'success'
				? (
					<LocationCards>
						<LocationCardPlaceholder />
					</LocationCards>
				)
				: placesQuery.data?.length
				? (
					<LocationCards singlePlace={placesQuery.data.length === 1}>
						{placesQuery.data.map((place) => (
							<LocationCard
								key={place.slug}
								name={place.name}
								address={place.address}
								previewURL={place.previewURL}
								slug={place.slug}
								fullWidth={placesQuery.data.length === 1}
							/>
						))}
					</LocationCards>
				)
				: (
					<>
						<div className='places-list-placeholder'>
							<FontAwesomeIcon icon={faMapLocationDot} size='10x' color={theme.colors.bgDarkAlt.toString()} />
							<div style={{ marginTop: '1rem', color: theme.colors.inputLabel.toString() }}>
								Start by clicking the &quot;Add place&quot; button!
							</div>
						</div>
					</>
				)}

			<div className='bottom'>
				{isAuthenticated
					? (
						<Button variant='secondary' onClick={handleLogout}>
							Log out
						</Button>
					)
					: (
						<>
							<div style={{ alignSelf: 'center', marginBottom: 10 }}>Already have places?</div>
							<Button variant='secondary' onClick={login}>Log in with Google</Button>
						</>
					)}

				<div className='footer'>
					<Button variant='primary' size='sm'>
						<FontAwesomeIcon icon={faTwitter} size='2x' />
					</Button>
					<Link href='https://github.com/drizzle-team/pathtrami-planetscale'>
						<a target='_blank'>
							<Button variant='primary' size='sm'>
								<FontAwesomeIcon icon={faGithub} size='2x' />
							</Button>
						</a>
					</Link>
					<Button variant='primary' size='sm' style={{ flex: 1 }}>
						What is Pathtrami?
					</Button>
				</div>
			</div>
		</Root>
	);
};

export default Home;

const Root = styled('div', {
	height: '100%',
	display: 'flex',
	flexFlow: 'column nowrap',

	'.places-list-placeholder': {
		flex: 1,
		// marginBottom: 140,
		alignSelf: 'center',
		display: 'flex',
		flexFlow: 'column nowrap',
		alignItems: 'center',
		justifyContent: 'center',
	},

	'.bottom': {
		marginTop: 'auto',
		paddingBottom: theme.sizes.screenPadding,
		display: 'flex',
		flexFlow: 'column nowrap',

		'.footer': {
			marginTop: 20,
			display: 'flex',
			flexFlow: 'row nowrap',
			alignItems: 'center',
			gap: 10,

			a: {
				display: 'flex',
				alignItems: 'center',
			},
		},
	},
});

const LocationCards = styled('div', {
	display: 'flex',
	flexFlow: 'row nowrap',
	gap: 15,
	overflowY: 'auto',

	variants: {
		singlePlace: {
			true: {
				justifyContent: 'center',
			},
		},
	},
});
