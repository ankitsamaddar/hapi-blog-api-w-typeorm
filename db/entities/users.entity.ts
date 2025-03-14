import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { SharedProp } from "./sharedProp.entity";
import { PostsEntity } from "./posts.entity";

export type UserType = "admin" | "user";

// Better approach
// enum UserType2 {
//   user = 'user', // -> 0
//   admin = 'admin' // -> 1
// }

@Entity({ name: "users" }) // default name : userEntity
export class UsersEntity extends SharedProp {
  constructor(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    salt: string,
    dateOfBirth?: Date,
    type?: UserType
  ) {
    super();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.salt = salt;
    this.dateOfBirth = dateOfBirth;
    this.type = type;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "first_name", nullable: false })
  firstName: string;

  @Column({ name: "last_name", nullable: false })
  lastName: string;

  @Column({ name: "date_of_birth", nullable: true })
  dateOfBirth: Date;

  @Column({ name: "email", unique: true, nullable: false })
  email: string;

  @Column({ default: "user" })
  type: UserType;

  // @Column({default: UserType2.user, type: 'enum', enum: UserType2})
  // type: UserType2

  @Column({nullable: false})
  password: string;
  
  @Column({nullable: false})
  salt: string;

  @OneToMany(() => PostsEntity, (post: PostsEntity) => post.user, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  posts: Array<PostsEntity>;

}

/**
 * for the 'type' use enum like this in mysql or postgres
 * enum UserType {
 *    user = 'user',
 *    admin = 'admin'
 * }
 * @Column({ default: UserType.user, enum: UserType. type: 'enum' })
 * type: UserType;
 */
