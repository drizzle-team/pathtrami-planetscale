declare module 'process' {
	global {
		namespace NodeJS {
			interface ProcessEnv {
				DATABASE_URL: string;
				CLOUDFLARE_ACCOUNT_ID: string;
				CLOUDFLARE_ACCESS_KEY_ID: string;
				CLOUDFLARE_SECRET_ACCESS_KEY: string;
				CLOUDFLARE_BUCKET_NAME: string;
				CLOUDFLARE_IMAGES_API_TOKEN: string;
			}
		}
	}
}
