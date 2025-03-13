import {Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from 'typeorm'
import { UsersEntity } from './users.entity'
import { SharedProp } from './sharedProp.entity'

@Entity({name: 'posts'})
export class PostsEntity extends SharedProp {
  constructor(title: string, content: string, userId: number) {
    super();
    this.title = title;
    this.content = content;
    this.userId = userId
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({type: 'text'})
  content: string;

  @Column({name: 'user_id', nullable: false})
  userId: number;



  @ManyToOne(() => UsersEntity, (user: UsersEntity) => user.posts)
  @JoinColumn({name: 'user_id'})
  user: UsersEntity;
}
