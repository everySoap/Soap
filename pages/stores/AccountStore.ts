import { action, computed, observable } from 'mobx';

import { UpdateProfileSettingDto, UserEntity } from '@pages/common/interfaces/user';
import { request } from '@pages/common/utils/request';

export class AccountStore {
  @computed get isLogin() {
    return !!this.userInfo;
  }
  /**
   * 登录的用户信息
   *
   * @type {UserEntity}
   * @memberof AccountStore
   */
  @observable public userInfo?: UserEntity;

  // 用来初始化
  @action
  public update = (store?: Partial<AccountStore>) => {
    if (store) {
      if (store.userInfo !== undefined) {
        this.setUserInfo(store.userInfo);
      }
    }
  }

  @action
  public setUserInfo = (userInfo?: UserEntity) => {
    this.userInfo = userInfo;
  }

  @action
  public updateProfile = async (userInfo: UpdateProfileSettingDto) => {
    const params = new FormData();
    for (const key in userInfo) {
      if (key) {
        params.append(key, (userInfo as any)[key]);
      }
    }
    const { data } = await request.post<UserEntity>(`/api/user/${this.userInfo!.username}/setting/profile`, params);
    this.setUserInfo(data);
  }
  /**
   * 登录
   *
   * @memberof AccountStore
   */
  public login = async (username: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    params.append('grant_type', 'password');
    const data = await request.post('oauth/token', params, {
      headers: {
        Authorization: `Basic ${process.env.BASIC_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    this.setUserInfo(data.data.user);
  }

}
