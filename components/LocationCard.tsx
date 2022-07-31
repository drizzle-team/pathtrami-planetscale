import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { RectShape, TextBlock } from 'react-placeholder/lib/placeholders';

import 'react-placeholder/lib/reactPlaceholder.css';

import Plus from '~/public/plus_white.svg';
import { styled, theme } from '~/stitches.config';

const Map = dynamic(() => import('~/components/Map'), { ssr: false });

interface Props {
	name: string;
	address: string;
	previewURL: string;
	slug: string;
	fullWidth?: boolean;
}

const LocationCard: FC<Props> = ({ name, address, previewURL, slug, fullWidth = false }) => {
	return (
		<Root>
			<Link href={`/${slug}`}>
				<a>
					<div className='preview'>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img className='image' src={previewURL} alt={name} />
					</div>
					<TextWrapper>
						<div>
							<b>{name}</b>
						</div>
						<div>{address}</div>
					</TextWrapper>
				</a>
			</Link>
		</Root>
	);
};

export default LocationCard;

export const LocationCardLoader: FC = () => (
	<Root>
		<div className='preview'>
			<RectShape className='image' color={theme.colors.bgDarkAlt.toString()} />
		</div>
		<TextWrapper>
			<TextBlock rows={2} color={theme.colors.bgDarkAlt.toString()} />
		</TextWrapper>
	</Root>
);

export const LocationCardPlaceholder: FC = () => {
	return (
		<Root className='placeholder'>
			<Image src={Plus.src} width={Plus.width} height={Plus.height} alt='Plus' />
			Add place
		</Root>
	);
};

const Root = styled('div', {
	flex: '0 0 auto',
	borderRadius: 8,
	border: '2px solid #A9D1FF',
	padding: '4px 4px 34px 4px',
	userSelect: 'none',
	width: 294,
	height: 383,

	'&.placeholder': {
		backgroundColor: theme.colors.bgDarkAlt,
		border: '1px dashed #FFF',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
	},

	'.preview': {
		height: theme.sizes.mapHeight,
		borderRadius: `${theme.sizes.borderRadius}px ${theme.sizes.borderRadius}px 0 0`,
		overflow: 'hidden',

		'.image': {
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
