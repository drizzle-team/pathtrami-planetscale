import { GoogleOAuthProvider } from '@react-oauth/google';
import { globalCss } from '@stitches/react';
import type { AppProps } from 'next/app';
import Router from 'next/router';
import NProgress from 'nprogress';
import { ReactElement, ReactNode } from 'react';
import { QueryClientProvider } from 'react-query';

import 'normalize.css/normalize.css';
import 'nprogress/nprogress.css';

import { NextPage } from 'next';
import { styled, theme } from '~/stitches.config';
import queryClient from '~/utils/queryClient';

export type NextPageWithLayout = NextPage & {
	getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

NProgress.configure({
	showSpinner: false,
});

function loadingDone() {
	NProgress.done();
}

Router.events.on('routeChangeStart', () => {
	NProgress.start();
});
Router.events.on('routeChangeComplete', loadingDone);
Router.events.on('routeChangeError', loadingDone);

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

	html: {
		height: '100%',
	},

	body: {
		width: '100vw',
		height: '100%',
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
	maxWidth: theme.sizes.maxWidth,
	overflow: 'hidden',
	margin: '0 auto',
	padding: '0 15px',
	position: 'relative',
	height: '100%',
});
