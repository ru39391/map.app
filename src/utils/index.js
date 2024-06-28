import {
  FILIAL_KEY,
  ATM_KEY,
  POINT_KEY,
  TERMINAL_KEY
} from './constants';

import { fetchFilialData } from './fetchFilialData';
import { fetchAtmData } from './fetchAtmData';
import { fetchPointData } from './fetchPointData';
import { fetchTerminalData } from './fetchTerminalData';

const fetchersData = {
  [FILIAL_KEY]: async () => await fetchFilialData(),
  [ATM_KEY]: async () => await fetchAtmData(),
  [POINT_KEY]: async () => await fetchPointData(),
  [TERMINAL_KEY]: async () => await fetchTerminalData(),
}

export {
  fetchersData
};
