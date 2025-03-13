import "reflect-metadata";
import { DataSource } from "typeorm";
import { UsersEntity, PostsEntity } from "./entities";
import { fakeUsers, fakePosts } from "./fakeData";
import "colors";

export const initDb = async (): Promise<DataSource> => {
  const entities = [UsersEntity, PostsEntity];
  const fakeFuncs = [fakeUsers, fakePosts];
  const con = await new DataSource({
    type: "sqlite",
    database: "./db/database/hapi.db",
    entities: entities,
    // logging: ['error'],
    // logger: "advanced-console",
  }).initialize();
  await con.synchronize(true);

  const userCount = await con.getRepository(UsersEntity).count();
  const postCount = await con.getRepository(PostsEntity).count();

  if (userCount ==  0 || postCount == 0) {
    console.log("Creating fake Data...".yellow.bold);
    for (const func of fakeFuncs) {
      await func(con);
    }
  }else {
    console.log("FakeData already exists, skipping...".green.bold);
  }

  entities.forEach((entity) => console.log(`Created ${entity.name}`.blue));
  return con;
};

/*
NOTES ON JS :

Each function in JS has some properties which can be accessed with dot notation like
- name: the name of the function
- length: the number of arguments the function takes
- prototype: the prototype of the function
- caller: the function that called the current function
- arguments: an array-like object containing the arguments passed to the function
- apply, call, bind: methods used to change the value of this inside a function
*/

/*
Also note that JS donot have classes, they are constructor functions and constructor functions are objects.
*/
