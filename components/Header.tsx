import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import { styled, theme } from '~/stitches.config';

import LogoSvg from '~/public/logo.svg';

interface Props {
	actions: React.ReactNode;
}

const Header: FC<Props> = ({ actions }) => {
	return (
		<Root>
			<Link href='/'>
				<a>
					<Logo>
						Pathtrami
						{
							<div className='image'>
								<Image
									src={LogoSvg.src}
									width={LogoSvg.width / 3}
									height={LogoSvg.height / 3}
									alt='Pathtrami'
								/>
							</div>
						}
					</Logo>
				</a>
			</Link>
			<div>{actions}</div>
		</Root>
	);
};

export default Header;

const Root = styled('div', {
	flex: '0 0 auto',
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'space-between',
	alignItems: 'center',
	height: 79,
});

const Logo = styled('div', {
	fontFamily: theme.fonts.logo,
	fontSize: 20,
	fontWeight: 400,
	display: 'flex',
	flexFlow: 'row nowrap',
	alignItems: 'center',
	gap: 6,
	whiteSpace: 'nowrap',
	userSelect: 'none',
});
