import * as Hapi from "@hapi/hapi";
import { Server, ResponseToolkit, Request } from "@hapi/hapi";
import "colors";
import { get } from "node-emoji";
import { initDb } from "./db";
import { userController } from "./controllers";
import { DataSource } from "typeorm";

const init = async () => {
  const server: Server = Hapi.server({
    port: 3000,
    host: "localhost",
  });

  // server.route({
  //   method: "GET",
  //   path: "/",
  //   handler: (request: Request, h: ResponseToolkit, err?: Error) => {
  //     return { msg: "Hello World!" };
  //   },
  // });

  const con: DataSource =   await initDb();
  console.log(get('dvd'), 'DB init -> Done!', get('dvd'))

  // Set the routes
  server.route(userController(con));

  await server.start().then(() => {
    console.log(
      get("rocket"),
      `Server running on ${server.info.uri}`.green,
      get("rocket")
    );
  });
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
