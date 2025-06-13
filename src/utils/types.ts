import {
  ATM_KEY,
  FILIAL_KEY,
  POINT_KEY,
  TERMINAL_KEY,
  DEFAULT_KEY,
  SELECTED_KEY,
  PARTNER_KEY,
  BEELINE_KEY,
  KARI_KEY,
  KH_KEY,
  LXNET_KEY,
  MTS_KEY,
  RUPOST_KEY,
  COORDS_KEY,
  LOCATION_KEY,
  LOCATION_ID_KEY,
  LOCATION_CODE_KEY
} from './constants';

export type THandledData<T> = { isSucceed: boolean; data: T | null; };

export type TPointsFilterKeys = typeof BEELINE_KEY | typeof KARI_KEY | typeof KH_KEY | typeof LXNET_KEY | typeof MTS_KEY | typeof RUPOST_KEY;

export type TPointsFilterValues = {
  key: TPointsFilterKeys;
  caption: string;
  request: string;
  target: HTMLInputElement;
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
  lon?: string;
  lat?: string;
  workingStatus?: TWorkingStatus;
  [COORDS_KEY]?: number[];
};

export type TPointsFilterData = Partial<Record<TPointsFilterKeys, TPointsFilterValues>>;

export type TPointsFilterList = {
  title: string;
  params: (Record<'caption' | 'request', string> & { key: TPointsFilterKeys; })[];
  desc: Record<'caption' | 'value', string>[];
};

export type TFilterData = Record<'params' | typeof LOCATION_KEY | typeof LOCATION_CODE_KEY, string> & {
  data: Record<string, 1 | 0> | TPointsFilterData | null;
  type: TCategoryData['category'] | typeof POINT_KEY;
  [COORDS_KEY]: number[];
};

export type TCategoryListData = Record<'caption' | 'category', string> & Pick<TFilterData, 'type'>;

export type TLocationData = Record<typeof LOCATION_ID_KEY, string> & Pick<TFilterData, typeof LOCATION_KEY | typeof LOCATION_CODE_KEY | typeof COORDS_KEY> & Pick<TPointsFilterValues, 'boundedBy'> & { isPopular: boolean; };

export type TDeptsData = Record<TCategoryData['category'], Record<'name' | 'code', string>[]> & { cities: (Record<string, string> & Record<'UF_RANGE_LOW_LAT' | 'UF_RANGE_LOW_LNG' | 'UF_RANGE_UP_LAT' | 'UF_RANGE_UP_LNG' | 'UF_RADIUS' | 'UF_SORT', string | null>)[]; };

export type TMarkerIcons = Record<typeof DEFAULT_KEY | typeof SELECTED_KEY, Record<typeof DEFAULT_KEY | typeof PARTNER_KEY | TPointsFilterKeys, Record<string, string>>>;

export type TMarkerOptions = { iconLayout: string; iconImageHref?: string; } & Record<'iconImageSize' | 'iconImageOffset', number[]>;

export type TMapRendererData = Pick<TFilterData, typeof COORDS_KEY> & {
  arr: Partial<TItemData>[];
  bounds: TLocationData['boundedBy'];
  config: TMarkerOptions;
  icons: TMarkerIcons;
};

export type TMapState = Partial<Record<'center' | typeof COORDS_KEY, TLocationData[typeof COORDS_KEY]>> & {
  bounds?: TLocationData['boundedBy'];
  controls: ymaps.Map['controls'];
  zoom: number;
};

export type TMapClusterData = Pick<TItemData, 'id' | 'key' | 'isPartner'> & Record<'lon' | 'lat', number> & { options: ymaps.IOptionManager };
