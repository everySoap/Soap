import { ApolloError, AuthenticationError } from 'apollo-server';
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { Inject, Service } from 'typedi';

import { User } from '@entities/User';
import { UserService } from '@services/user';
import { UserInput } from './input';

@Service()
@Resolver(of => User)
export class UserResolver {
  @Inject()
  public userService: UserService;

  @Query(returns => User)
  public async viewer(@Ctx() context: any) {
    try {
      const oauth = await import('../../oauth');
      await oauth.default.authenticate(context.req, context.res, ['user', 'admin']);
      return context.req.auth.user;
    } catch (err) {
      throw new AuthenticationError(err.message);
    }
  }

  @Query(returns => User)
  public async user(
    @Arg('username') username: string,
  ) {
    const data = await this.userService.getOne(username);
    if (!data) {
      throw new ApolloError(`not resolve a User username '${username}'`, 'NOT_FOUND');
    }
    return data;
  }

  @Authorized()
  @Mutation(returns => Boolean)
  public async updateUser(
    @Arg('user') user: UserInput,
    @Arg('id') id: number,
    @Ctx() context: any,
  ) {
    if (id !== context.req.auth.user.id) {
      // throw new ApolloError(`not resolve a User username '${username}'`, 'NOT_FOUND');
    }
    await this.userService.update(id, user);
    return true;
  }
}
