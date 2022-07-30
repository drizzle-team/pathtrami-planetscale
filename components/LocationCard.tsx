import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import { styled, theme } from '~/stitches.config';

const Map = dynamic(() => import('~/components/Map'), { ssr: false });

interface Props {
	name: string;
	address: string;
	previewURL: string;
	location: {
		lat: number;
		lng: number;
	};
	slug: string;
}

const LocationCard: FC<Props> = ({ name, address, previewURL, location, slug }) => {
	return (
		<Link href={`/${slug}`}>
			<a>
				<Root>
					<div className='preview'>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={previewURL} alt={name} />
					</div>
					<TextWrapper>
						<div>
							<b>{name}</b>
						</div>
						<div>{address}</div>
					</TextWrapper>
				</Root>
			</a>
		</Link>
	);
};

export default LocationCard;

const Root = styled('div', {
	borderRadius: 8,
	border: '2px solid #A9D1FF',
	padding: '4px 4px 34px 4px',
	userSelect: 'none',

	'.preview': {
		width: theme.sizes.cardMapWidth,
		height: theme.sizes.mapHeight,
		borderRadius: `${theme.sizes.borderRadius}px ${theme.sizes.borderRadius}px 0 0`,
		overflow: 'hidden',

		img: {
			width: '100%',
			height: '100%',
			objectFit: 'cover',
		},
	},
});

const TextWrapper = styled('div', {
	padding: '0 6px',
	marginTop: 11,
});
