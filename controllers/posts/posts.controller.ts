import { DataSource, Repository } from "typeorm";
import { ServerRoute, ResponseToolkit, Request } from "@hapi/hapi";
import { UsersEntity, PostsEntity } from "../../db/entities";

export const postController = (con: DataSource): Array<ServerRoute> => {
  const postRepo: Repository<PostsEntity> = con.getRepository(PostsEntity);
  return [
    {
      method: "POST",
      path: "/posts",
      handler: async (
        {
          payload,
          auth: {
            credentials: { user },
          },
        }: Request,
        h: ResponseToolkit,
        err?: Error
      ) => {
        const { title, content } = payload as Partial<PostsEntity>;

        const p: Partial<PostsEntity> = new PostsEntity(
          title,
          content,
          (user as UsersEntity).id
        );
        const postRes = await postRepo.save<Partial<PostsEntity>>(p);
        return postRes;
      },
      options: {
        auth: {
          strategy: "jwt",
        },
      },
    },
  ];
};
