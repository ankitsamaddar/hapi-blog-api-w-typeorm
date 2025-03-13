import { DataSource, Repository } from "typeorm";
import { ServerRoute, ResponseToolkit, Request } from "@hapi/hapi";
import { UsersEntity, PostsEntity } from "../../db/entities";

export const postController = (con: DataSource): Array<ServerRoute> => {
  const postRepo: Repository<PostsEntity> = con.getRepository(PostsEntity);
  return [
    {
      method: "GET",
      path: "/posts",
      handler: async (
        { query: { page, limit } }: Request,
        h: ResponseToolkit,
        err?: Error
      ) => {
        const pageNumber = page ? Number(page) : 1;
        const limitNumber = limit ? Number(limit) : 10;
        const [posts, totalPosts] = await postRepo.findAndCount({
          skip: (pageNumber - 1) * limitNumber,
          take: limitNumber,
        });

        const totalPages = Math.ceil(totalPosts / limitNumber);
        const nextPage =
          pageNumber < totalPages
            ? `http://localhost:3000/posts?page=${
                pageNumber + 1
              }&limit=${limitNumber}`
            : null;
        const prevPage =
          pageNumber > 1
            ? `http://localhost:3000/posts?page=${
                pageNumber - 1
              }&limit=${limitNumber}`
            : null;

        return {
          posts: posts,
          totalPosts: totalPosts,
          page: pageNumber,
          totalPages: totalPages,
          next: nextPage,
          prev: prevPage,
        };
      },
    },
    {
      method: "GET",
      path: "/posts/{id}",
      handler: async ({ params: { id } }: Request) => {
        const post = await postRepo.findOne({
          where: { id: Number(id) },
        });

        return post;
      },
    },
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
    {
      method: "PATCH",
      path: "/posts/{id}",
      handler: async (
        {
          params: { id },
          payload,
          auth: {
            credentials: { user },
          },
        }: Request,
        h: ResponseToolkit
      ) => {
        try {
          const post = await postRepo.findOne({ where: { id: Number(id) } });
          if (!post) {
            return h.response({ error: "Post not found" }).code(404);
          }

          if (
            post.userId !== (user as UsersEntity).id &&
            (user as UsersEntity).type !== "admin"
          ) {
            return h.response({ error: "Unauthorized User." }).code(403);
          }

          Object.keys(payload).forEach((key) => (post[key] = payload[key]));
          await postRepo.save(post);
          return post;
        } catch (error) {
          console.error(`Error patching the post`.red.bold, error);
          return h.response({ error: "Internal Server Error" }).code(500);
        }
      },
      options: {
        auth: "jwt",
      },
    },
    {
      method: "DELETE",
      path: "/posts/{id}",
      handler: async (
        {
          params: { id },
          auth: {
            credentials: { user },
          },
        }: Request,
        h: ResponseToolkit
      ) => {
        try {
          const post = await postRepo.findOne({ where: { id: Number(id) } });

          if (!post) {
            return h.response({ error: "Post not found" }).code(404);
          }

          if (
            post.userId !== (user as UsersEntity).id &&
            (user as UsersEntity).type !== "admin"
          ) {
            return h.response({ error: "Unauthorized User." }).code(403);
          }

          await postRepo.remove(post);
          return {msg: "Post Deleted Successfully", ...post};
        } catch (error) {
          console.error(`Error deleting the post`.red.bold, error);
          return h.response({ error: "Internal Server Error" }).code(500);
        }
      },
      options: {
        auth: "jwt",
      },
    },
  ];
};
