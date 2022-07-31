import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import EditMode from '~/components/place/EditMode';

const New: NextPage = () => {
	const router = useRouter();

	const handleCancel = () => {
		router.back();
	};

	const handleSave = (slug: string) => {
		router.replace(`/${slug}`);
	};

	return (
		<>
			<Head>
				<title>New place - Pathtrami</title>
			</Head>

			<EditMode
				onCancel={handleCancel}
				onSave={handleSave}
				pathChunks={router.query['path'] as string[] | undefined ?? []}
			/>
		</>
	);
};

export default New;
