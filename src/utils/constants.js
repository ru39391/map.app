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
const SELECTED_KEY = 'selected';
const SELECTED_CLOSED_KEY = 'selected_closed';
const CLUSTER_KEY = 'cluster';
const CLUSTER_CLOSED_KEY = 'cluster_closed';
const PARTNER_KEY = 'partner';
const PARTNER_CLOSED_KEY = 'partner';
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

const MAP_ID = 'map';
const API_URL = '/api/branches/';
const ICONS_URL = './src/assets/map-icons';

const PARTNER_NAME = 'Газпромбанк';

const MAP_PINS = {
  [DEFAULT_KEY]: `${ICONS_URL}/pin-icon.svg`,
  [CLOSED_KEY]: `${ICONS_URL}/pin-closed-icon.svg`,
  [SELECTED_KEY]: `${ICONS_URL}/pin-selected-icon.svg`,
  [SELECTED_CLOSED_KEY]: `${ICONS_URL}/pin-selected-closed-icon.svg`,
  [CLUSTER_KEY]: `${ICONS_URL}/cluster-icon.svg`,
  [CLUSTER_CLOSED_KEY]: `${ICONS_URL}/cluster-closed-icon.svg`,
  [BEELINE_KEY]: `${ICONS_URL}/beeline-icon.png`,
  [MTS_KEY]: `${ICONS_URL}/mts-icon.png`,
  [KH_KEY]: `${ICONS_URL}/kh-icon.png`,
  [LXNET_KEY]: `${ICONS_URL}/lxnet-icon.png`,
  [KARI_KEY]: `${ICONS_URL}/kari-icon.png`,
  [RUPOST_KEY]: `${ICONS_URL}/rupost-icon.png`,
};

export {
  PARTNER_NAME,
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
  SELECTED_KEY,
  SELECTED_CLOSED_KEY,
  CLUSTER_KEY,
  CLUSTER_CLOSED_KEY,
  PARTNER_KEY,
  PARTNER_CLOSED_KEY,
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
  MAP_PINS,
  MAP_ID,
  API_URL
};
