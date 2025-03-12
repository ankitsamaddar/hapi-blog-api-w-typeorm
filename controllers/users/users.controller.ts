import { DataSource, Repository } from "typeorm";
import { UsersEntity, PostsEntity } from "../../db/entities";
import { ResponseToolkit, ServerRoute, Request } from "@hapi/hapi";

export const userController = (con: DataSource): Array<ServerRoute> => {
  const userRepo: Repository<UsersEntity> = con.getRepository(UsersEntity);
  return [
    {
      method: "GET",
      path: "/users",
      handler: async ({ query }: Request, h: ResponseToolkit, err?: Error) => {
        let { perPage, page, ...q } = query;
        let realPage: number; // Store the offset for the records in the database
        let realTake: number; // No. of records per page
        // Parse records per page
        if (perPage) realTake = +perPage;
        else {
          perPage = "10";
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
            ? `http://localhost:3000/users?perPage=${realTake}&page=${
                +page + 1
              }${qParams}`
            : null;
        const prevPage =
          +page > 1
            ? `http://localhost:3000/users?perPage=${realTake}&page=${
                +page - 1
              }${qParams}`
            : null;

        // Generate the response
        return {
          data: await userRepo.find(findOptions),
          perPage: realTake,
          page: +page || 1,
          totalPages: totalPages,
          next: nextPage,
          prev: prevPage,
        };
      },
    },
    {
      method: "GET",
      path: "/users/{id}",
      handler: (request: Request, h: ResponseToolkit, err?: Error) => {
        return userRepo.findOneBy({ id: Number(request.params.id) });
      },
    },
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
          dateOfBirth
        );
        return userRepo.save<Partial<UsersEntity>>(u);
      },
    },
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

        const updatedUser = await userRepo.findOneBy({ id: Number(id) });
        return updatedUser;
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
    },
  ];
};
