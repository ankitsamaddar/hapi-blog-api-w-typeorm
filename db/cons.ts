import 'reflect-metadata'
import { DataSource } from 'typeorm';
import { UsersEntity } from './entities';
export const initDb = async () : Promise<DataSource> => {
  const con = await new DataSource({
    type: 'sqlite',
    database: './hapi.db',
    entities: [UsersEntity],
  }).initialize()
  await con.synchronize(true);
  return con;
}
