const FILIAL_KEY = 'filial';
const ATM_KEY = 'atm';
const POINT_KEY = 'point';
const TERMINAL_KEY = 'terminal';
const FILTER_KEY = 'filter';

const ADDRESS_KEY = 'address';
const LOCATION_KEY = 'location';
const LOCATION_CODE_KEY = 'locationCode';

const DEFAULT_KEY = 'default';
const CLOSED_KEY = 'closed';
const BEELINE_KEY = 'beeline';
const MTS_KEY = 'mts';
const KH_KEY = 'kh';
const KARI_KEY = 'kari';
const LXNET_KEY = 'lxnet';
const RUPOST_KEY = 'rupost';

const DEFAULT_LOC = 'Москва';
const DEFAULT_LOC_CODE = 'MOSKVA';
const DEFAULT_COORDS = [55.755773,37.617815];
const DEFAULT_BOUNDS = [[55.491126,37.32624],[55.957565,37.967682]];
const LOCATION_LIST = ['Москва', 'Санкт-Петербург', 'Екатеринбург', 'Новосибирск', 'Омск', 'Ростов-на-Дону'];

const MAP_ID = 'map';
const API_URL = '/api/branches/';
const ICONS_URL = './src/assets/map-icons';

const MAP_PINS = {
  [DEFAULT_KEY]: `${ICONS_URL}/pin-icon.svg`,
  [CLOSED_KEY]: `${ICONS_URL}/pin-closed-icon.svg`,
  [BEELINE_KEY]: `${ICONS_URL}/beeline-icon.png`,
  [MTS_KEY]: `${ICONS_URL}/mts-icon.png`,
  [KH_KEY]: `${ICONS_URL}/kh-icon.png`,
  [LXNET_KEY]: `${ICONS_URL}/lxnet-icon.png`,
  [KARI_KEY]: `${ICONS_URL}/kari-icon.png`,
  [RUPOST_KEY]: `${ICONS_URL}/rupost-icon.png`,
};

export {
  FILIAL_KEY,
  ATM_KEY,
  POINT_KEY,
  TERMINAL_KEY,
  FILTER_KEY,
  ADDRESS_KEY,
  LOCATION_KEY,
  LOCATION_CODE_KEY,
  DEFAULT_KEY,
  CLOSED_KEY,
  BEELINE_KEY,
  MTS_KEY,
  KH_KEY,
  KARI_KEY,
  LXNET_KEY,
  RUPOST_KEY,
  DEFAULT_LOC,
  DEFAULT_LOC_CODE,
  DEFAULT_COORDS,
  DEFAULT_BOUNDS,
  LOCATION_LIST,
  MAP_PINS,
  MAP_ID,
  API_URL
};
