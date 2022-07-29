import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useQuery } from 'react-query';

import Button from '~/components/Button';
import Header from '~/components/Header';
import LocationCard from '~/components/LocationCard';
import { styled } from '~/stitches.config';
import { Place } from './api/places';

const Home: NextPage = () => {
	const placesQuery = useQuery('places', async () => {
		const { data } = await axios.get<Place[]>('/api/places');
		return data;
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
							location={place.location}
							slug={place.slug}
						/>
					))}
				</LocationCards>
			)}
		</Root>
	);
};

export default Home;

const Root = styled('div', {
	height: '100%',
	display: 'flex',
	flexFlow: 'column nowrap',

	'.swiper': {
		width: '100%',
	},

	'.swiper-slide': {
		width: 'auto',
	},
});

const LocationCards = styled('div', {
	display: 'flex',
	flexFlow: 'row nowrap',
	gap: 15,
	overflowY: 'auto',
});
