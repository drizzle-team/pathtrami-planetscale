import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FC } from 'react';

import { styled, theme } from '~/stitches.config';

const Map = dynamic(() => import('~/components/Map'), { ssr: false });

interface Props {
	name: string;
	address: string;
	location: {
		lat: number;
		lng: number;
	};
	slug: string;
}

const LocationCard: FC<Props> = ({ name, address, location, slug }) => {
	return (
		<Link href={`/${slug}`}>
			<a>
				<Root>
					<div className='map'>
						<Map mode='view' static markerLocation={location} />
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

	'.map': {
		width: theme.sizes.cardMapWidth,
		height: theme.sizes.mapHeight,
		borderRadius: `${theme.sizes.borderRadius}px ${theme.sizes.borderRadius}px 0 0`,
		overflow: 'hidden',
	},
});

const TextWrapper = styled('div', {
	padding: '0 6px',
	marginTop: 11,
});
