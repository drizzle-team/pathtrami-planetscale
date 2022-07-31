import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FC } from 'react';
import { RectShape, TextBlock } from 'react-placeholder/lib/placeholders';

import 'react-placeholder/lib/reactPlaceholder.css';

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
		<Root fullWidth={fullWidth}>
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

export const LocationCardPlaceholder: FC = () => (
	<Root>
		<div className='preview'>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<RectShape className='image' color={theme.colors.bgDarkAlt.toString()} />
		</div>
		<TextWrapper>
			<TextBlock rows={2} color={theme.colors.bgDarkAlt.toString()} />
		</TextWrapper>
	</Root>
);

const Root = styled('div', {
	borderRadius: 8,
	border: '2px solid #A9D1FF',
	padding: '4px 4px 34px 4px',
	userSelect: 'none',

	variants: {
		fullWidth: {
			true: {
				'a, .preview': {
					width: '100%',
				},
			},
		},
	},

	'.preview': {
		width: theme.sizes.cardMapWidth,
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
