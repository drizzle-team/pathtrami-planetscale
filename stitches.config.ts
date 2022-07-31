import { createStitches } from '@stitches/react';

export const { styled, getCssText, theme } = createStitches({
	theme: {
		fonts: {
			system: 'Poppins, sans-serif',
			logo: "'Hittedal Script', sans-serif",
		},
		colors: {
			bg: '#1B1D1F',
			text: '#FFF',
			textAlt: '#0E0E0E',
			bgAlt: '#FFF',
			bgButtonSecondary: 'rgba(255, 255, 255, 0.1)',
			bgDarkAlt: '#323435',
			bgButtonCTA: '#FCAB00',
			inputLabel: '#868789',
			inputBorder: '#494A4C',
		},
		fontSizes: {
			text: '16px',
			button: '14px',
			sm: '12px',
		},
		fontWeights: {
			text: 400,
			textBold: 700,
			button: 500,
		},
		sizes: {
			cardMapWidth: '282px',
			mapPreviewWidth: '538px',
			mapHeight: '282px',
			borderRadius: '4px',
			lineHeight: '24px',
			screenPadding: '15px',
			maxWidth: '500px',
		},
		transitions: {
			duration: '150ms',
		},
	},
});
