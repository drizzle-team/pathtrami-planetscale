import * as drizzle from 'drizzle-orm';
import { MySqlConnector } from 'drizzle-orm-mysql';
import mysql from 'mysql2/promise';
import once from 'lodash.once';

import { places } from '~/models/places';
import { placesImages } from '~/models/places_images';
import { users } from '~/models/users';

export const getConnection = once(async () => {
	const mysqlConn = await mysql.createConnection(process.env.DATABASE_URL);
	return drizzle.connect(
		new MySqlConnector(mysqlConn, { users, places, placesImages }),
	);
});
