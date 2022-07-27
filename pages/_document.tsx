import { Head, Html, Main, NextScript } from 'next/document';

import { getCssText, styled } from '~/stitches.config';

export default function render() {
	return (
		<Html>
			<Head>
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
					href='http://fonts.cdnfonts.com/css/hittedal-script'
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
