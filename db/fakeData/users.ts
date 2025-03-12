import { faker } from "@faker-js/faker";
const { person, internet, date, helpers } = faker;

import {Condition, DataSource, Repository} from 'typeorm';
import {UsersEntity, UserType} from '../entities'
import 'colors'
import {get} from 'node-emoji'
import {genSalt, hash } from 'bcryptjs'

export const fakeUsers = async (con: DataSource, amount: number = 50) => {
  const userRepo: Repository<UsersEntity> = con.getRepository(UsersEntity);

  for await (const _ of Array.from({length: amount})) {

    const firstName: string = person.firstName();
    const lastName: string = person.lastName();
    const email: string = internet.email({firstName, lastName});
    const dateOfBirth: Date = date.birthdate();
    const type: UserType = helpers.arrayElement(['admin', 'user']);
    const salt = await genSalt();
    const password = await hash('secret', salt);


    const u: Partial<UsersEntity> = new UsersEntity(
      firstName,
      lastName,
      email,
      password,
      salt,
      dateOfBirth,
      type
    );
    await userRepo.save<Partial<UsersEntity>>(u);
  }
  const emoji = get('white_check_mark')
  console.log(`${emoji} ${amount} fake users created`.magenta.bold, emoji);
};
