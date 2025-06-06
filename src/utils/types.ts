import {
  ATM_KEY,
  FILIAL_KEY,
  POINT_KEY,
  TERMINAL_KEY,
  BEELINE_KEY,
  KARI_KEY,
  KH_KEY,
  LXNET_KEY,
  MTS_KEY,
  RUPOST_KEY
} from './constants';

export type THandledData<T> = { isSucceed: boolean; data: T | null; };

export type TPointsFilterKeys = typeof BEELINE_KEY | typeof KARI_KEY | typeof KH_KEY | typeof LXNET_KEY | typeof MTS_KEY | typeof RUPOST_KEY;

export type TPointsFilterValues = {
  key: TPointsFilterKeys;
  caption: string;
  request: string;
  target: Record<string, string>;
  checked: boolean;
  boundedBy: number[][];
};

export type TWorkingStatus = {
  isWork: boolean;
  time: string;
};

export type TCategoryData = Record<string, string> & {
  category: typeof ATM_KEY | typeof FILIAL_KEY | typeof TERMINAL_KEY;
  individual: 1 | 0;
  work_time: Record<string, string>;
};

export type TItemData = {
  id?: string;
  key?: TPointsFilterKeys;
  phone?: string[];
  name: string;
  address: string;
  individual: boolean;
  isPartner: boolean;
  workMode: string[];
  workModeCom: string[];
  coords?: number[];
  workingStatus?: TWorkingStatus;
};

export type TPointsFilterData = Partial<Record<TPointsFilterKeys, TPointsFilterValues>>;

export type TFilterData = Record<string, string> & {
  data: Record<string, 1 | 0> | TPointsFilterData | null;
  coords: Required<Pick<TItemData, 'coords'>>;
  type: TCategoryData['category'] | typeof POINT_KEY;
  //params: string;
  //[LOCATION_KEY]: string;
  //[LOCATION_CODE_KEY]: string;
};
