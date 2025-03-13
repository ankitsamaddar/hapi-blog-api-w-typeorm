import * as Hapi from "@hapi/hapi";
import { Server, ResponseToolkit, Request } from "@hapi/hapi";
import "colors";
import { get } from "node-emoji";
import { initDb } from "./db";
import { userController, authController, postController } from "./controllers";
import { DataSource } from "typeorm";
import { validateBasic, validateJWT } from "./auth";
import * as Package from "./package.json";
// Hapi Packages
import * as Vision from '@hapi/vision'
import * as Inert from '@hapi/inert'
import * as HapiSwagger from 'hapi-swagger'

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

  const con: DataSource = await initDb();
  console.log(get("dvd"), "DB init -> Done!", get("dvd"));

  // Register the plugins
  await server.register(require('@hapi/basic'));
  await server.register(require('hapi-auth-jwt2'))
  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: {
        info: {
          title: "Blogs API Documentation",
          description: "This is the API documentation for the Blogs API.",
          version: Package.version,
          contact: {
            name: "Ankit Samaddar",
            url: "https://ankitsamaddar.github.io",
            email: "ankitsam0602@gmail.com",
          },

          license: {
            name: "MIT",
            url: "https://opensource.org/licenses/MIT",
          },
        },
        tags: [
          { name: "users", description: "User related endpoints" },
          { name: "posts", description: "Post related endpoints" },
        ],
        documentationPath: "/docs",
        jsonPath: "/swagger.json",
        swaggerUIPath: "/swaggerui/",
        schemes: ["http", "https"],
        expanded: "list",
        sortEndpoints: "ordered",
      },
    },
  ]);

  // Auth strategy
  server.auth.strategy('simple', 'basic', {validate: validateBasic(con)})
  server.auth.strategy("jwt", "jwt", {
    key: "getSecretFromEnvHere",
    validate: validateJWT(con)
  });

  // Set the routes
  server.route([...userController(con), ...authController(con), ...postController(con)] as Array<Hapi.ServerRoute>);

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
