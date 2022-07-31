import { useGoogleLogin } from '@react-oauth/google';
import { keyframes } from '@stitches/react';
import { Credentials } from 'google-auth-library';
import type { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import NProgress from 'nprogress';
import { useMutation, useQuery } from 'react-query';

import Button from '~/components/Button';
import Header from '~/components/Header';
import LocationCard, { LocationCardLoader, LocationCardPlaceholder } from '~/components/LocationCard';
import Animated from '~/public/example.webp';
import GitHub from '~/public/github.svg';
import Plus from '~/public/plus_black.svg';
import Twitter from '~/public/twitter.svg';
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
								icon={<Image src={Plus.src} width={Plus.width} height={Plus.height} alt='Plus' />}
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
						<LocationCardLoader />
						<LocationCardLoader />
					</LocationCards>
				)
				: placesQuery.data?.length
				? (
					<LocationCards>
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
						<Link href='/new'>
							<a>
								<LocationCardPlaceholder />
							</a>
						</Link>
					</LocationCards>
				)
				: (
					<>
						<div className='places-list-placeholder'>
							Create your first place ☝️
						</div>
						<div className='hand'>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							{/* <img src={Animated.src} alt='Pathtrami' /> */}
						</div>
					</>
				)}

			<div className='bottom'>
				{isAuthenticated
					? !!process.env.NEXT_PUBLIC_SHOW_LOGOUT_BUTTON && (
						<>
							<Button variant='secondary' onClick={handleLogout}>
								Log out
							</Button>
							<hr />
						</>
					)
					: (
						<>
							<div style={{ alignSelf: 'center' }}>Already have places?</div>
							<Button variant='secondary' onClick={login}>Continue with Google</Button>
							<hr />
						</>
					)}

				<div className='footer'>
					<Button variant='secondary' noPadding>
						<Image src={Twitter.src} width={Twitter.width} height={Twitter.height} alt='Twitter' />
					</Button>
					<Link href='https://github.com/drizzle-team/pathtrami-planetscale'>
						<a target='_blank'>
							<Button variant='secondary' noPadding>
								<Image src={GitHub.src} width={GitHub.width} height={GitHub.height} alt='GitHub' />
							</Button>
						</a>
					</Link>
					<Button variant='secondary' style={{ flex: 1 }}>
						What is Pathtrami?
					</Button>
				</div>
				<div className='attribution'>
					Created for <a href='https://planetscale.com/?utm_source=hashnode&utm_medium=hackathon&utm_campaign=announcement_article' target='_blank' rel='noreferrer'>PlanetScale</a> &{' '}
					<a href='https://hashnode.com/?source=planetscale_hackathon_announcement' target='_blank' rel='noreferrer'>Hashnode</a> July 2022 hackathon
				</div>
			</div>
		</Root>
	);
};

export default Home;

const handAnimation = keyframes({
	'0%': {
		transform: 'translate(-50%, -50%) rotate(15deg)',
	},
	'50%': {
		transform: 'translate(-50%, calc(-50% - 50px)) rotate(-45deg)',
	},
	'100%': {
		transform: 'translate(-50%, -50%) rotate(15deg)',
	},
});

const Root = styled('div', {
	height: '100%',
	display: 'flex',
	flexFlow: 'column nowrap',
	position: 'relative',

	'.places-list-placeholder': {
		marginRight: 40,
		alignSelf: 'flex-end',
		display: 'flex',
		flexFlow: 'column nowrap',
		alignItems: 'center',
		justifyContent: 'center',
		color: theme.colors.inputLabel,
	},

	'.hand': {
		position: 'absolute',
		left: '50%',
		top: '50%',
		// width: 300,
		// height: 300,
		transform: 'translate(-50%, -50%)',
		transformOrigin: '50px 200px',
		// animation: `${handAnimation} 1s infinite`,

		img: {
			width: '100%',
			height: '100%',
		},
	},

	'.bottom': {
		marginTop: 'auto',
		paddingBottom: theme.sizes.screenPadding,
		display: 'flex',
		flexFlow: 'column nowrap',
		gap: 5,
		color: theme.colors.inputLabel,
		fontSize: theme.fontSizes.sm,

		hr: {
			width: '100%',
			height: 1,
			border: 0,
			backgroundColor: theme.colors.bgButtonSecondary.toString(),
		},

		'.footer': {
			display: 'flex',
			flexFlow: 'row nowrap',
			alignItems: 'center',
			gap: 10,

			button: {
				width: 48,
			},

			a: {
				display: 'flex',
				alignItems: 'center',
			},
		},

		'.attribution': {
			alignSelf: 'center',
			fontSize: theme.fontSizes.sm,
			textAlign: 'center',

			'&, a': {
				color: theme.colors.inputLabel,
			},

			a: {
				textDecoration: 'underline',
			},
		},
	},
});

const LocationCards = styled('div', {
	display: 'flex',
	flexFlow: 'row nowrap',
	gap: 15,
	overflowY: 'auto',
});
