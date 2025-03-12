import { DataSource, Repository } from "typeorm";
import { UsersEntity, PostsEntity } from "../../db/entities";
import { ResponseToolkit, ServerRoute, Request } from "@hapi/hapi";

export const userController = (con: DataSource): Array<ServerRoute> => {
  const userRepo: Repository<UsersEntity> = con.getRepository(UsersEntity);
  return [
    {
      method: "GET",
      path: "/users",
      handler: ({query}: Request, h: ResponseToolkit, err?: Error) => {
        const options = {where: {... query}}
        if(!query) delete options.where
        return userRepo.find(options);
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
          await con.getRepository(PostsEntity).createQueryBuilder().update().set({ userId: null }).where("userId = :id", { id: Number(id) }).execute();

          await userRepo.delete(id);
            return h.response({ msg: "User And Records Deleted Successfully!", user: u }).code(200);
        } catch (error) {
          console.error("Error deleting user:", error);
          return h.response({ message: "Internal Server Error" }).code(500);
        }
      },
    },
  ];
};
