import { globalCss } from '@stitches/react';
import type { AppProps } from 'next/app';
import { QueryClientProvider } from 'react-query';
import { config } from '@fortawesome/fontawesome-svg-core';

import '@fortawesome/fontawesome-svg-core/styles.css';
import 'normalize.css/normalize.css';

import queryClient from '~/utils/queryClient';
import { styled, theme } from '~/stitches.config';

config.autoAddCss = false;

function MyApp({ Component, pageProps }: AppProps) {
	globalStyles();

	return (
		<QueryClientProvider client={queryClient}>
			<Root>
				<Component {...pageProps} />
			</Root>
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
	maxWidth: 768,
	overflow: 'hidden',
	margin: '0 auto',
	padding: '0 15px',
});
