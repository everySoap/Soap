import { action, observable } from 'mobx';

import { IPictureListRequest, PictureEntity } from '@pages/common/interfaces/picture';
import { request } from '@pages/common/utils/request';
import { BaseStore } from './BaseStore';

interface IBaseQuery {
  page: number;
  pageSize: number;
  timestamp: number;
  [key: string]: number | string;
}

export class PictureStore extends BaseStore {
  @observable public loading = true;
  @observable public init = false;
  @observable public list: PictureEntity[] = [];
  @observable public listQuery: IBaseQuery = {
    page: 1,
    pageSize: 10,
    timestamp: Number(new Date().toISOString()),
  };
  @observable public count: number = 0;

  @action
  public getList = async (query?: IBaseQuery) => {
    this.init = true;
    const { data } = await request.get<IPictureListRequest>('/api/picture', {
      data: {
        ...this.listQuery,
        ...query,
      },
    });
    this.setData(data);
  }

  @action
  public setData = (data: IPictureListRequest) => {
    this.list = data.data;
    this.listQuery.page = data.page;
    this.listQuery.pageSize = data.pageSize;
    this.listQuery.timestamp = data.timestamp;
    this.count = data.count;
  }
}