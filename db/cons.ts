import "reflect-metadata";
import { DataSource } from "typeorm";
import "colors";
import { UsersEntity, PostsEntity } from "./entities";

export const initDb = async (): Promise<DataSource> => {
  const entities = [UsersEntity, PostsEntity];
  const con = await new DataSource({
    type: "sqlite",
    database: "./hapi.db",
    entities: entities,
  }).initialize();
  await con.synchronize(true);
  entities.forEach((entity) => console.log(`Created ${entity.name}`.blue));
  return con;
};

/*
Each function in JS has some properties like
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
