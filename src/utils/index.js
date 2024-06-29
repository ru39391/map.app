import {
  FILIAL_KEY,
  ATM_KEY,
  POINT_KEY,
  TERMINAL_KEY,
  ADDRESS_KEY,
  LOCATION_KEY
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

const handleLocationData = async (value) => {
  let data = {isSucceed: false, data: null};

  try {
    const ymapsRes = await new Promise((resolve) => ymaps.ready(resolve));
    const geocodeRes = await ymapsRes.geocode(value);

    data = {
        isSucceed: true,
        data: {
          [LOCATION_KEY]: value,
          coords: geocodeRes.geoObjects.get(0).geometry.getCoordinates()
        }
    };
  } catch (error) {
    console.error(error);
  }

  console.log('handleLocationData: ', data);

  return data;
}

const setLocation = async (value) => {
  let data = {isSucceed: false, data: null};

  const isLocationSet = (key) => localStorage.getItem(key) !== null;
  const setLocationData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

  try {
    const { isSucceed, data: locData } = await handleLocationData(value);

    if(isSucceed) {
      if(isLocationSet(LOCATION_KEY)) {
        localStorage.removeItem(LOCATION_KEY);
        setLocationData(LOCATION_KEY, locData);
      } else {
        setLocationData(LOCATION_KEY, locData);
      }

      data = isLocationSet(LOCATION_KEY)
        ? {
          isSucceed: isLocationSet(LOCATION_KEY),
          data: JSON.parse(localStorage.getItem(LOCATION_KEY))
        }
        : data;
    }
  } catch (error) {
    console.error(error);
  }

  return data;
}

const handleLocationList = (arr, key = '') => arr.reduce(
  (acc, item) => {
    const data = {};

    if(item[ADDRESS_KEY].includes('г.') || item[ADDRESS_KEY].includes('ст.')) {
      const str = item[ADDRESS_KEY].includes('г.') ? item[ADDRESS_KEY].split('г.')[1] : item[ADDRESS_KEY].split('ст.')[1];
      data[LOCATION_KEY] = str.split(',')[0].trim();

      return [...acc, key ? {...data, [ADDRESS_KEY]: item[ADDRESS_KEY], [key]: item[key]} : data[LOCATION_KEY] ];
    } else {
      return acc;
    }
  }, []
);

export {
  fetchersData,
  setLocation,
  handleLocationList
};
