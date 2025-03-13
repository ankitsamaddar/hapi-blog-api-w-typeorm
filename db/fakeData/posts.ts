import { faker } from "@faker-js/faker";
// name, lorem, helpers
import { Condition, DataSource, Repository } from "typeorm";
import { PostsEntity, UsersEntity } from "../entities";
import "colors";
import { get } from "node-emoji";

export const fakePosts = async (con: DataSource) => {
  let postAmount = 0;
  const postRepo: Repository<PostsEntity> = con.getRepository(PostsEntity);
  const userRepo: Repository<UsersEntity> = con.getRepository(UsersEntity);
  const users: Array<UsersEntity> = await userRepo.find(); // pass {take: number}
  for (const user of users) {
    const shouldWeCreate: boolean = faker.datatype.boolean();
    if (!shouldWeCreate) {
      const title = faker.person.jobTitle();
      const content = faker.lorem.paragraphs();
      const title2 = faker.person.jobTitle();
      const content2 = faker.lorem.paragraphs();
      const p: Partial<PostsEntity> = new PostsEntity(title, content, user.id);
      const p2: Partial<PostsEntity> = new PostsEntity(title2, content2, user.id);

      // Wait
      await postRepo.save<Partial<PostsEntity>>(p);
      await postRepo.save<Partial<PostsEntity>>(p2);
    }
    postAmount += 2;
  }
  const emoji = get("white_check_mark");
  console.log(
    emoji,
    `${postAmount} fake posts created for ${postAmount / 2} users`.magenta.bold,
    emoji
  );
};
