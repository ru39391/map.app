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

const handleLocationData = async (value) => {
  let data = {isSucceed: false, data: null};

  try {
    const ymapsRes = await new Promise((resolve) => ymaps.ready(resolve));
    const geocodeRes = await ymapsRes.geocode(value);

    data = {
        isSucceed: true,
        data: {
          location: value,
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
    const key = isSucceed ? Object.keys(locData).find((_, index) => typeof Object.values(locData)[index] === 'string') : null;

    if(isSucceed) {
      if(isLocationSet(key)) {
        localStorage.removeItem(key);
        setLocationData(key, locData);
      } else {
        setLocationData(key, locData);
      }

      data = isLocationSet(key)
        ? {
          isSucceed: isLocationSet(key),
          data: JSON.parse(localStorage.getItem(key))
        }
        : data;
    }
  } catch (error) {
    console.error(error);
  }

  return data;
}

export {
  fetchersData,
  setLocation
};
