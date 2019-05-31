import { BadGatewayException, BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import crypto from 'crypto';
import { Repository } from 'typeorm';

import { EmailService } from '@server/common/modules/email/email.service';
import { validator } from '@server/common/utils/validator';
import { GetPictureListDto } from '@server/picture/dto/picture.dto';
import { PictureService } from '@server/picture/picture.service';
import { Maybe, MutablePartial, MutableRequired } from '@typings/index';
import { plainToClass } from 'class-transformer';
import { CreateUserDto, UpdateProfileSettingDto } from './dto/user.dto';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    private pictureService: PictureService,
    private emailService: EmailService,
    @InjectRepository(UserEntity)
    private userEntity: Repository<UserEntity>,
  ) {}

  public async createUser(data: CreateUserDto & Partial<UserEntity>): Promise<UserEntity> {
    const salt = await crypto.randomBytes(32).toString('hex');
    const hash = await crypto.pbkdf2Sync(data.password, salt, 20, 32, 'sha512').toString('hex');
    const user = await this.userEntity.save(
      this.userEntity.create({
        salt,
        hash,
        ...data,
        username: data.username,
        email: data.email,
      }),
    );
    return user;
  }

  public async signup(data: CreateUserDto, isEmail: boolean = true) {
    const user = await this.userEntity.findOne({ email: data.email });
    if (user) {
      throw new BadRequestException('email is registered');
    }
    const info: MutablePartial<UserEntity> = {};
    if (isEmail) {
      info.identifier = data.email;
      info.verificationToken = Math.random().toString(35).substr(2, 6);
    }
    const userInfo = await this.createUser({
      ...data,
      ...info,
    });
    // 发送email验证邮件
    if (isEmail) {
      try {
        await this.emailService.sendSignupEmail(info.identifier!, info.verificationToken!, userInfo);
      } catch (err) {
        Logger.error(err);
        throw new BadRequestException('email failed to send');
      }
    }
    return {
      message: 'email is send',
    };
  }

  public async verifyUser(username: string, password: string): Promise<UserEntity | undefined> {
    const user = await this.userEntity.createQueryBuilder('user')
      .where('user.username=:username', { username })
      .getOne();
    if (user) {
      const hash = await crypto.pbkdf2Sync(password, user.salt, 20, 32, 'sha512').toString('hex');
      if (hash !== user.hash) {
        return undefined;
      }
      if (!user.verified) {
        throw new UnauthorizedException('email is not activated');
      }
      return plainToClass(UserEntity, user);
    }
    return undefined;
  }

  public async getUser(query: string, user: Maybe<UserEntity>, groups?: string[]): Promise<UserEntity> {
    const q = this.userEntity.createQueryBuilder('user')
      .loadRelationCountAndMap(
        'user.pictureCount', 'user.pictures',
      );
    const isId = validator.isNumberString(query);
    if (isId) {
      q.where('user.id=:id', { id: query });
    } else {
      q.where('user.username=:username', { username: query });
    }
    if (user) {
      q
        .loadRelationCountAndMap(
          'user.likes', 'user.pictureActivitys', 'activity',
          qb => qb.andWhere(
            `activity.${isId ? 'userId' : 'userUserName'}=:query AND activity.like=:like`,
            { query, like: true },
          ),
        );
    }
    const data = await q.cache(100).getOne();
    return plainToClass(UserEntity, data, {
      groups,
    });
  }

  public async getUserPicture(idOrName: string , query: GetPictureListDto, user: Maybe<UserEntity>) {
    return this.pictureService.getUserPicture(idOrName, query, user);
  }

  public async getUserLikePicture(idOrName: string , query: GetPictureListDto, user: Maybe<UserEntity>) {
    return this.pictureService.getUserLikePicture(idOrName, query, user);
  }

  public async updateUser(user: UserEntity, body: Partial<UserEntity>, groups?: string[]) {
    const data = await this.userEntity.save(
      this.userEntity.merge(
        user,
        body,
      ),
    );
    return plainToClass(UserEntity, data, {
      groups,
    });
  }

  public async updateUserProfile(user: UserEntity, body: UpdateProfileSettingDto, avatar?: string, groups?: string[]) {
    const data = await this.userEntity.save(
      this.userEntity.merge(
        user,
        body,
        avatar ? { avatar } : {},
      ),
    );
    return plainToClass(UserEntity, data, {
      groups,
    });
  }
}
