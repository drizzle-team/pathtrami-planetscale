declare module 'process' {
	global {
		namespace NodeJS {
			interface ProcessEnv {
				DATABASE_URL: string;
			}
		}
	}
}
