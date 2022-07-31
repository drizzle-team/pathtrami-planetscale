import { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';

import { getCssText } from '~/stitches.config';

export default function render() {
	return (
		<Html>
			<Head>
				<link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
				<link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
				<link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
				<link rel='manifest' href='/site.webmanifest' />
				<link rel='mask-icon' href='/safari-pinned-tab.svg' color='#5bbad5' />
				<meta name='msapplication-TileColor' content='#da532c' />
				<meta name='theme-color' content='#ffffff' />
				<Script src='https://accounts.google.com/gsi/client' strategy='beforeInteractive' />
				<link
					rel='stylesheet'
					href='https://unpkg.com/leaflet@1.8.0/dist/leaflet.css'
					integrity='sha512-hoalWLoI8r4UszCkZ5kL8vayOGVae1oxXe/2A4AO6J9+580uKHDO3JdHb7NzwwzK5xr/Fs0W40kiNHxM9vyTtQ=='
					crossOrigin=''
				/>
				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link
					rel='preconnect'
					href='https://fonts.gstatic.com'
					crossOrigin='true'
				/>
				<link
					href='https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap'
					rel='stylesheet'
				/>
				<link
					href='https://fonts.cdnfonts.com/css/hittedal-script'
					rel='stylesheet'
				/>
				<style
					id='stitches'
					dangerouslySetInnerHTML={{ __html: getCssText() }}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
