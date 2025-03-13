import { DataSource, Repository } from "typeorm";
import { UsersEntity, PostsEntity } from "../../db/entities";
import { ResponseToolkit, ServerRoute, Request } from "@hapi/hapi";
import * as Joi from 'joi'

export const userController = (con: DataSource): Array<ServerRoute> => {
  const userRepo: Repository<UsersEntity> = con.getRepository(UsersEntity);
  return [
    {
      method: "GET",
      path: "/users",
      handler: async ({ query }: Request, h: ResponseToolkit, err?: Error) => {
        let { limit, page, ...q } = query;
        let realPage: number; // Store the offset for the records in the database
        let realTake: number; // No. of records per page
        // Parse records per page
        if (limit) realTake = +limit;
        else {
          limit = "10";
          realTake = 10;
        }
        // Parse the current page and calculate the offset in database
        if (page) realPage = +page === 1 ? 0 : (+page - 1) * realTake;
        else {
          page = "1";
          realPage = 0;
        }

        // Set query options
        const findOptions = {
          take: realTake,
          skip: realPage,
          where: { ...q },
        };
        if (!q) delete findOptions.where;
        // Append the query filters
        const getQuery = () =>
          Object.keys(q)
            .map((key: string) => `${key}=${q[key]}`)
            .join("&");
        const qParams = getQuery().length === 0 ? "" : `&${getQuery()}`;

        // Get the pagenations
        const totalRecords = await userRepo.count({ where: findOptions.where });
        const totalPages = Math.ceil(totalRecords / realTake);
        const nextPage =
          +page < totalPages
            ? `http://localhost:3000/users?limit=${realTake}&page=${
                +page + 1
              }${qParams}`
            : null;
        const prevPage =
          +page > 1
            ? `http://localhost:3000/users?limit=${realTake}&page=${
                +page - 1
              }${qParams}`
            : null;

        // Delete the hashed password and salt from data
        let data = await userRepo.find(findOptions);
        data.forEach((d: UsersEntity) => {
          delete d.password;
          delete d.salt;
        });

        // Generate the response
        return {
          data: data,
          perPage: realTake,
          page: +page || 1,
          totalPages: totalPages,
          next: nextPage,
          prev: prevPage,
        };
      },
      options: {
        auth: {
          strategy: "jwt",
        },
        description: "Get all users",
        notes: "Returns an array of users with pagenation.",
        tags: ["api", "users"],
      },
    },
    {
      method: "GET",
      path: "/users/{id}",
      handler: async (
        { params: { id } }: Request,
        h: ResponseToolkit,
        err?: Error
      ) => {
        try {
          let u = await userRepo.findOneBy({ id: Number(id) });
          delete u.password;
          delete u.salt;

          return u;
        } catch (err) {
          console.error("Error fetching user", err);
        }
      },
      options: {
        description: "Get a user by id",
        notes: "Returns a user details by id.",
        tags: ["api", "users"],
      },
    },
    /*
    {
      method: "POST",
      path: "/users",
      handler: ({ payload }: Request, h: ResponseToolkit, err?: Error) => {
        const { firstName, lastName, email, dateOfBirth } =
          payload as Partial<UsersEntity>;
        const u: Partial<UsersEntity> = new UsersEntity(
          firstName,
          lastName,
          email,
          password,
          salt,
          dateOfBirth
        );
        return userRepo.save<Partial<UsersEntity>>(u);
      },
    },
    */
    {
      method: "PATCH",
      path: "/users/{id}",
      handler: async (
        { params: { id }, payload }: Request,
        h: ResponseToolkit,
        err?: Error
      ) => {
        const u = await userRepo.findOneBy({ id: Number(id) });

        if (!u) {
          return h.response({ message: "User not found" }).code(404);
        }

        // Object.keys(payload).forEach((key) => {
        //   u[key] = payload[key];
        // });

        await userRepo.update(id, payload as Partial<UsersEntity>);

        let updatedUser: UsersEntity = await userRepo.findOneBy({
          id: Number(id),
        });

        delete updatedUser.password;
        delete updatedUser.salt;

        return updatedUser;
      },
      options: {
        validate: {
          payload: Joi.object({
            firstName: Joi.string().optional().max(250).min(3),
            lastName: Joi.string().optional().max(250).min(3),
            email: Joi.string().email().optional(),
            dateOfBirth: Joi.date()
              .optional()
              .min("1940-01-01")
              .max("2015-01-01"),
          }),
          // Throw proper error
          failAction: (request: Request, h: ResponseToolkit, err: Error) => {
            throw err;
          },
          options: {
            abortEarly: false, // to check and include all errors
          },
        },
        description: "Update a user by id",
        notes:
          "Update the database with with the payload and returns the updted user details",
        tags: ["api", "users"],
      },
    },
    {
      method: "DELETE",
      path: "/users/{id}",
      handler: async (
        { params: { id } }: Request,
        h: ResponseToolkit,
        err?: Error
      ) => {
        try {
          const u = await userRepo.findOneBy({ id: Number(id) });

          if (!u) {
            return h.response({ message: "User not found" }).code(404);
          }

          // Delete related records here (example for related 'posts' table)
          // await con.getRepository(PostsEntity).delete({ userId: Number(id) });

          // Update the posts records and set the userId to NULL
          await con
            .getRepository(PostsEntity)
            .createQueryBuilder()
            .update()
            .set({ userId: null })
            .where("userId = :id", { id: Number(id) })
            .execute();

          await userRepo.delete(id);

          // Delete password and salt
          delete u.password;
          delete u.salt;

          return h
            .response({
              msg: "User And Records Deleted Successfully!",
              user: u,
            })
            .code(200);
        } catch (error) {
          console.error("Error deleting user:", error);
          return h.response({ message: "Internal Server Error" }).code(500);
        }
      },
      options: {
        description: "Delete a user by id",
        notes: "Delete the user and related records from the database",
        tags: ["api", "users"],
      },
    },
  ];
};
