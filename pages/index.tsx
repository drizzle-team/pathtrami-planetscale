import type { NextPage } from 'next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from 'react-query';
import axios from 'axios';
import Link from 'next/link';

import 'swiper/css';

import Header from '~/components/Header';
import LocationCard from '~/components/LocationCard';
import { styled } from '~/stitches.config';
import Button from '~/components/Button';
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
				<Swiper spaceBetween={15} slidesPerView='auto'>
					{placesQuery.data.map((place) => (
						<SwiperSlide key={place.slug}>
							<LocationCard
								name={place.name}
								address={place.address}
								location={place.location}
								slug={place.slug}
							/>
						</SwiperSlide>
					))}
				</Swiper>
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

const Location = styled('div', {
	cursor: 'pointer',
	transition: 'all 150ms',

	'.title': {
		display: 'flex',
		flexFlow: 'row nowrap',
		alignItems: 'center',
	},

	img: {
		width: '32px',
	},
});

const LocationCards = styled('div', {
	display: 'flex',
	flexFlow: 'row nowrap',
	gap: 15,
});

const LocationCardSlide = styled(SwiperSlide, {
	width: 'auto',
});
