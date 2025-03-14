import { DataSource, Repository } from "typeorm";
import { UsersEntity } from "../../db/entities";
import { genSalt, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import * as Joi from "joi";
import { ServerRoute, Request, ResponseToolkit } from "@hapi/hapi";

export const authController = (con: DataSource): Array<ServerRoute> => {
  const userRepo: Repository<UsersEntity> = con.getRepository(UsersEntity);
  return [
    {
      method: "POST",
      path: "/login",
      handler: async ({ auth: { credentials } }: Request) => {
        console.log(credentials);
        return {
          ...credentials,
          accessToken: sign({ ...credentials }, "getSecretFromEnvHere"),
        };
      },
      options: {
        auth: {
          strategy: "simple",
        },
        validate: {
          payload: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required().min(5).max(15),
          }),
          // Throw proper error
          failAction: (request: Request, h: ResponseToolkit, err: Error) => {
            throw err;
          },
          options: {
            abortEarly: false, // to check and include all errors
          },
        },
        description: "Login",
        notes: "Logs in the user, returns a token",
        tags: ["api", "users"],
      },
    },
    {
      method: "POST",
      path: "/register",
      handler: async ({ payload, auth: { credentials } }: Request) => {
        const { firstName, lastName, email, password, dateOfBirth } =
          payload as Partial<UsersEntity>;
        const salt = await genSalt();
        const hashedPassword = await hash(password, salt);
        const u: Partial<UsersEntity> = new UsersEntity(
          firstName,
          lastName,
          email,
          hashedPassword,
          salt,
          dateOfBirth
        );
        await userRepo.save<Partial<UsersEntity>>(u);
        delete u.password;
        delete u.salt;

        return {
          ...u,
          accessToken: sign({ ...u }, "getSecretFromEnvHere"),
        };
      },
      options: {
        auth: false,
        validate: {
          payload: Joi.object({
            firstName: Joi.string().required().max(250).min(3),
            lastName: Joi.string().required().max(250).min(3),
            email: Joi.string().email().required(),
            dateOfBirth: Joi.date()
              .optional()
              .min("1940-01-01")
              .max("2015-01-01"),
            password: Joi.string().required().min(5).max(15),
          }),
          // Throw proper error
          failAction: (request: Request, h: ResponseToolkit, err: Error) => {
            throw err;
          },
          options: {
            abortEarly: false, // to check and include all errors
          },
        },
        description: "Register",
        notes: "Registers the user, returns a token",
        tags: ["api", "users"],
      },
    },
  ];
};
