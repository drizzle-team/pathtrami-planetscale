import { config } from '@fortawesome/fontawesome-svg-core';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { globalCss } from '@stitches/react';
import type { AppProps } from 'next/app';
import { ReactElement, ReactNode } from 'react';
import { QueryClientProvider } from 'react-query';

import '@fortawesome/fontawesome-svg-core/styles.css';
import 'normalize.css/normalize.css';

import { NextPage } from 'next';
import { styled, theme } from '~/stitches.config';
import queryClient from '~/utils/queryClient';

config.autoAddCss = false;

export type NextPageWithLayout = NextPage & {
	getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
	globalStyles();

	const getLayout = Component.getLayout ?? ((page) => page);
	const content = getLayout(<Component {...pageProps} />);

	return (
		<QueryClientProvider client={queryClient}>
			<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
				<Root>
					{content}
				</Root>
			</GoogleOAuthProvider>
		</QueryClientProvider>
	);
}

export default MyApp;

const globalStyles = globalCss({
	'*': {
		boxSizing: 'border-box',
	},

	body: {
		width: '100vw',
		height: '100vh',
		backgroundColor: theme.colors.bg,
		fontFamily: theme.fonts.system,
		fontWeight: theme.fontWeights.text,
		color: theme.colors.text,
		lineHeight: theme.sizes.lineHeight,
	},

	'#__next': {
		position: 'relative',
		width: '100%',
		height: ' 100%',
	},

	a: {
		color: theme.colors.text,
		textDecoration: 'none',
	},
});

const Root = styled('div', {
	maxWidth: 500,
	overflow: 'hidden',
	margin: '0 auto',
	padding: '0 15px',
	position: 'relative',
});
