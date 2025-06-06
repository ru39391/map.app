const FILIAL_KEY = "filial";
const ATM_KEY = "atm";
const POINT_KEY = "point";
const TERMINAL_KEY = "terminal";
const FILTER_KEY = "filter";

const ADDRESS_KEY = "address";
const LOCATION_KEY = "location";
const LOCATION_ID_KEY = "locationId";
const LOCATION_CODE_KEY = "locationCode";
const COORDS_KEY = "coords";

const DEFAULT_KEY = "default";
const SELECTED_KEY = "selected";
const PARTNER_KEY = "partner";
const PARTNER_SELECTED_KEY = "partner_selected";
const BEELINE_KEY = "beeline";
const BEELINE_SELECTED_KEY = "beeline_selected";
const LXNET_KEY = "lxnet";
const LXNET_SELECTED_KEY = "lxnet_selected";
const MTS_KEY = "mts";
const MTS_SELECTED_KEY = "mts_selected";
const KARI_KEY = "kari";
const KARI_SELECTED_KEY = "kari_selected";
const RUPOST_KEY = "rupost";
const RUPOST_SELECTED_KEY = "rupost_selected";
const KH_KEY = "kh";
const KH_SELECTED_KEY = "kh_selected";
const CLOSED_KEY = "closed";
const SELECTED_CLOSED_KEY = "selected_closed";
const CLUSTER_KEY = "cluster";
const CLUSTER_CLOSED_KEY = "cluster_closed";
const CARDS_LIST_LENGTH = 20;
const DEFAULT_LOC_ID = "283";
const DEFAULT_LOC = "Москва";
const DEFAULT_LOC_CODE = "MOSKVA";
const DEFAULT_COORDS = [55.755773, 37.617815];
const DEFAULT_BOUNDS = [
  [55.491126, 37.32624],
  [55.957565, 37.967682],
];
const DEFAULT_LOCATION_DATA = {
  [LOCATION_ID_KEY]: DEFAULT_LOC_ID,
  [LOCATION_KEY]: DEFAULT_LOC,
  [LOCATION_CODE_KEY]: DEFAULT_LOC_CODE,
  [COORDS_KEY]: DEFAULT_COORDS,
  boundedBy: DEFAULT_BOUNDS,
  isPopular: true
};

const MAP_ID = "map";
const API_URL = "/api/branches/";
const LOC_API_URL = "/api/cities/";
const ASSETS_URL = "/static";
const ICONS_URL = `${ASSETS_URL}/icons`;
const GEO_SWITCHER_URL = "/local/geolocation/switch-region-ajax.php";

const GEO_NAME_SEL = ".js-p-choose-city-open span";

const PARTNER_NAME = "Газпромбанк";

const MAP_PINS = {
  [DEFAULT_KEY]: `${ICONS_URL}/pin-icon.svg`,
  [SELECTED_KEY]: `${ICONS_URL}/pin-selected-icon.svg`,
  [PARTNER_KEY]: `${ICONS_URL}/pin-partner-icon.svg`,
  [PARTNER_SELECTED_KEY]: `${ICONS_URL}/pin-selected-partner-icon.svg`,
  [BEELINE_KEY]: `${ICONS_URL}/beeline-icon.svg`,
  [BEELINE_SELECTED_KEY]: `${ICONS_URL}/beeline-selected-icon.svg`,
  [LXNET_KEY]: `${ICONS_URL}/lxnet-icon.svg`,
  [LXNET_SELECTED_KEY]: `${ICONS_URL}/lxnet-selected-icon.svg`,
  [MTS_KEY]: `${ICONS_URL}/mts-icon.svg`,
  [MTS_SELECTED_KEY]: `${ICONS_URL}/mts-selected-icon.svg`,
  [KARI_KEY]: `${ICONS_URL}/kari-icon.svg`,
  [KARI_SELECTED_KEY]: `${ICONS_URL}/kari-selected-icon.svg`,
  [RUPOST_KEY]: `${ICONS_URL}/rupost-icon.svg`,
  [RUPOST_SELECTED_KEY]: `${ICONS_URL}/rupost-selected-icon.svg`,
  [KH_KEY]: `${ICONS_URL}/kh-icon.svg`,
  [KH_SELECTED_KEY]: `${ICONS_URL}/kh-selected-icon.svg`,
  [CLUSTER_KEY]: `${ICONS_URL}/cluster-icon.svg`,
  [CLUSTER_CLOSED_KEY]: `${ICONS_URL}/cluster-closed-icon.svg`,
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
  LOCATION_ID_KEY,
  LOCATION_CODE_KEY,
  COORDS_KEY,
  DEFAULT_LOC,
  DEFAULT_LOC_ID,
  DEFAULT_LOC_CODE,
  DEFAULT_COORDS,
  DEFAULT_BOUNDS,
  DEFAULT_LOCATION_DATA,
  MAP_PINS,
  MAP_ID,
  API_URL,
  LOC_API_URL,
  ASSETS_URL,
  GEO_SWITCHER_URL,
  DEFAULT_KEY,
  SELECTED_KEY,
  PARTNER_KEY,
  PARTNER_SELECTED_KEY,
  BEELINE_KEY,
  BEELINE_SELECTED_KEY,
  LXNET_KEY,
  LXNET_SELECTED_KEY,
  MTS_KEY,
  MTS_SELECTED_KEY,
  KARI_KEY,
  KARI_SELECTED_KEY,
  RUPOST_KEY,
  RUPOST_SELECTED_KEY,
  KH_KEY,
  KH_SELECTED_KEY,
  CLUSTER_KEY,
  CLUSTER_CLOSED_KEY,
  CLOSED_KEY,
  SELECTED_CLOSED_KEY,
  GEO_NAME_SEL,
  CARDS_LIST_LENGTH,
};
