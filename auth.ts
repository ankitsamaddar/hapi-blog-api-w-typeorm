import { DataSource, Repository } from "typeorm";
import { Request, ResponseToolkit, AuthCredentials } from "@hapi/hapi";
import { UsersEntity } from "./db/entities";
import { hash } from "bcryptjs";
import "colors";
export const validateBasic = (con: DataSource) => {
  const userRepo: Repository<UsersEntity> = con.getRepository(UsersEntity);
  return async (
    request: Request,
    username: string,
    password: string,
    h: ResponseToolkit,
    err?: Error
  ) => {
    const user: UsersEntity = await userRepo.findOneBy({ email: username });
    if (!user) {
      return { credentials: null, isValid: false };
    }

    const isValid = (await hash(password, user.salt)) === user.password;
    delete user.password;
    delete user.salt;
    // credentials - a credential objec passed back to the application in `request.auth.credentials`.
    return { isValid, credentials: user };
  };
};

export const validateJWT = (con: DataSource) => {
  const userRepo: Repository<UsersEntity> = con.getRepository(UsersEntity);
  return async (
    decoded: Partial<UsersEntity>,
    request: Request,
    h: ResponseToolkit
  ) => {
    try {
      const user: UsersEntity = await userRepo.findOneBy({ id: Number(decoded.id) });
      if (!user) {
        return { isValid: false, credentials: null };
      }
      delete user.password;
      delete user.salt;
      const cred = {user} as AuthCredentials;
      return { isValid: true, credentials: cred};
    } catch (err) {
      console.error(`ERROR VALIDATING JWT`.red.bold, err);
    }
  };
};
