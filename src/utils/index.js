import {
  FILIAL_KEY,
  ATM_KEY,
  POINT_KEY,
  TERMINAL_KEY,
  ADDRESS_KEY,
  LOCATION_KEY,
  LOCATION_CODE_KEY
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

const handlePointsData = async ({ key, request, boundedBy }) => {
  let data = {isSucceed: false, data: null};

  try {
    const ymapsRes = await new Promise((resolve) => ymaps.ready(resolve));
    const searchRes = await ymapsRes.search(request, { results: 10000, boundedBy });
    const resultsArr = searchRes.geoObjects.properties.get('resultsArray');

    //console.log(resultsArr.map(item => item.properties));

    data = {
        isSucceed: true,
        data: resultsArr.map(item => ({
          key,
          id: item.properties.get('id'),
          name: item.properties.get('name'),
          address: item.properties.get('address'),
          phone: item.properties.get('phoneNumbers'),
          workingStatus: item.properties.get('workingStatus'),
          workMode: [item.properties.get('workingTime')],
          coords: item.geometry.getCoordinates(),
        }))
    };
  } catch (error) {
    console.error(error);
  }

  console.log('handlePointsData: ', data);

  return data;
}

const handleLocationData = async ({value, code}) => {
  let data = {isSucceed: false, data: null};

  try {
    const ymapsRes = await new Promise((resolve) => ymaps.ready(resolve));
    const geocodeRes = await ymapsRes.geocode(value, { results: 1 });
    const geoObject = geocodeRes.geoObjects.get(0);

    data = {
        isSucceed: true,
        data: {
          [LOCATION_KEY]: value,
          [LOCATION_CODE_KEY]: code,
          coords: geoObject.geometry.getCoordinates(),
          boundedBy: geoObject.properties.get('boundedBy')
        }
    };
  } catch (error) {
    console.error(error);
  }

  console.log('handleLocationData: ', data);

  return data;
}

const setLocation = async (values) => {
  let data = {isSucceed: false, data: null};

  const isLocationSet = (key) => localStorage.getItem(key) !== null;
  const setLocationData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

  if(isLocationSet(LOCATION_KEY)) {
    localStorage.removeItem(LOCATION_KEY);
    setLocationData(LOCATION_KEY, values);
  } else {
    setLocationData(LOCATION_KEY, values);
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      isLocationSet(LOCATION_KEY)
        ? resolve({
            isSucceed: isLocationSet(LOCATION_KEY),
            data: JSON.parse(localStorage.getItem(LOCATION_KEY))
          })
        : reject({ ...data });
    }, 200);
  });
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
  handleLocationList,
  handlePointsData,
};
