import {
  FILTER_KEY,
  LOCATION_KEY,
  LOCATION_ID_KEY,
  LOCATION_CODE_KEY,
  COORDS_KEY,
  DEFAULT_LOC,
  DEFAULT_LOC_ID,
  DEFAULT_LOC_CODE,
  DEFAULT_COORDS,
  DEFAULT_BOUNDS,
  GEO_NAME_SEL,
  GEO_SWITCHER_URL,
} from "./constants";
import type {
  TDeptsData,
  TFilterData,
  THandledData,
  TItemData,
  TLocationData,
  TPointsFilterValues
} from "./types";

import axios from "axios";

import { fetchFilterData } from "./fetchFilterData";

/**
 * Конвертирует в строку данные фильтра,
 * используемые для создания выборки
 * @property {TFilterData['data']} data - данные для создания выборки
 * @returns {string} обработанные данные
*/
const stringifyFilterData = (data: TFilterData['data']): string => {
  if(!data) {
    return '';
  }

  return Object.keys(data).reduce(
    (acc, item, index) =>
      acc + `${index === 0 ? "?" : "&"}${item}=${Object.values(data)[index]}`,
    ""
  );
}

/**
 * Возвращает данные выборки точек погашения
 * @property {TPointsFilterValues['key']} key - ключ группы организаций
 * @property {TPointsFilterValues['request']} request - значение запроса для API Я.Карт
 * @property {TPointsFilterValues['boundedBy']} boundedBy - массив значений координат, ограничивающих область отображения на карте
*/
const handlePointsData = async ({ key, request, boundedBy }: Pick<TPointsFilterValues, 'key' | 'request' | 'boundedBy'>): Promise<THandledData<TItemData[]>> => {
  let data: THandledData<TItemData[]> = { isSucceed: false, data: null };
  const { ymaps } = window;

  try {
    const ymapsRes: typeof ymaps = await new Promise((resolve) => ymaps.ready(resolve as () => any));
    //@ts-ignore
    const searchRes = await ymapsRes.search(request, { results: 10000, boundedBy });
    const resultsArr = searchRes.geoObjects.properties.get("resultsArray") as ymaps.IGeoObject[];

    data = {
      isSucceed: true,
      data: resultsArr.map((item) => {
        const coords = item.geometry?.getBounds();
        const workingTime = item.properties.get('workingTime', []) as string | TItemData['workMode'];
        const props = {
          id: item.properties.get('id', { id: undefined }),
          name: item.properties.get('name', { name: '' }),
          address: item.properties.get('address', { address: '' }),
        };

        return {
          ...Object.entries(props).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: typeof value === 'string' ? value : value[key]
          }), {} as Pick<TItemData, 'id' | 'name' | 'address'>),
          key,
          phone: item.properties.get('phoneNumbers', []) as TItemData['phone'],
          workMode: Array.isArray(workingTime) ? workingTime : [workingTime],
          workingStatus: item.properties.get('workingStatus', {}) as TItemData['workingStatus'],
          [COORDS_KEY]: Array.isArray(coords) ? coords[0] : boundedBy[0],
          individual: false,
          isPartner: false,
          workModeCom: [] as string[]
        }
      })
    };
  } catch (error) {
    console.error(error);
  }

  console.log("handlePointsData: ", data);

  return data;
};

/**
 * Возвращает координаты населённого пункта и область карты для его отображения,
 * полученные по названию при помощи API Я.Карт
 * @property {TFilterData[typeof LOCATION_KEY]} value - название населённого пункта
 * @property {TFilterData[typeof LOCATION_CODE_KEY]} code - внутренний id местоположения
*/
const handleLocationData = async (
  { value, code }: { value: TFilterData[typeof LOCATION_KEY]; code: TFilterData[typeof LOCATION_CODE_KEY]; }
): Promise<THandledData<Omit<TLocationData, typeof LOCATION_ID_KEY | 'isPopular'>>> => {
  let data: THandledData<Omit<TLocationData, typeof LOCATION_ID_KEY | 'isPopular'>> = { isSucceed: false, data: null };

  try {
    const ymapsRes = await new Promise((resolve) => ymaps.ready(resolve));
    const geocodeRes = await ymapsRes.geocode(value, { results: 1 });
    const geoObject = geocodeRes.geoObjects.get(0);

    data = {
      isSucceed: true,
      data: {
        [LOCATION_KEY]: value,
        [LOCATION_CODE_KEY]: code,
        [COORDS_KEY]: geoObject.geometry.getCoordinates(),
        boundedBy: geoObject.properties.get("boundedBy"),
      },
    };
  } catch (error) {
    console.error(error);
  }

  console.log("handleLocationData: ", data);

  return data;
};

/**
 * Преобразует входящие данные геолокации в удобный для обработки объект данных местоположения
 * @property {TDeptsData['cities'][number]} data - объект данных одного из населённых пунктов, где представлен банк
 * @returns {TLocationData} данные местоположения
*/
const handleLocationItem = (data: TDeptsData['cities'][number]): TLocationData => {
  const {
    ID,
    UF_NAME,
    UF_XML_ID,
    UF_LATITUDE,
    UF_LONGITUDE,
    UF_RANGE_LOW_LAT,
    UF_RANGE_LOW_LNG,
    UF_RANGE_UP_LAT,
    UF_RANGE_UP_LNG,
    UF_TOP,
  } = data;
  const [coords, leftBottom, rightTop] = [
    [UF_LATITUDE, UF_LONGITUDE],
    [UF_RANGE_LOW_LAT, UF_RANGE_LOW_LNG],
    [UF_RANGE_UP_LAT, UF_RANGE_UP_LNG],
  ].map((item) => [Number(item[0]), Number(item[1])]);

  return {
    [LOCATION_ID_KEY]: ID,
    [LOCATION_KEY]: UF_NAME,
    [LOCATION_CODE_KEY]: UF_XML_ID,
    coords,
    boundedBy: [leftBottom, rightTop],
    isPopular: UF_TOP === null ? Boolean(UF_TOP) : Boolean(Number(UF_TOP)),
  };
};

/**
 * Удаляет данные из хранилища сессии
 * @property {typeof LOCATION_KEY | typeof FILTER_KEY} key - ключ параметра
*/
const removeStorageItem = (key: typeof LOCATION_KEY | typeof FILTER_KEY = LOCATION_KEY) => {
  sessionStorage.removeItem(key);
};

/**
 * Возвращает данные текущего местоположения после записи в локальное хранилище
 * @property {TLocationData} values - данные текущего местоположения
*/
const setLocation = async (values: TLocationData): Promise<THandledData<TLocationData>> => {
  let data = { isSucceed: false, data: null };

  const isLocationSet = (key: typeof LOCATION_KEY) => localStorage.getItem(key) !== null;
  const setLocationData = (key: typeof LOCATION_KEY, data: TLocationData) => localStorage.setItem(key, JSON.stringify(data));

  if (isLocationSet(LOCATION_KEY)) {
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
            data: JSON.parse(localStorage.getItem(LOCATION_KEY) as string)
          })
        : reject({ ...data });
    }, 200);
  });
};

/**
 * Возвращает текущие данные фильтра после записи в хранилище сессии
 * @property {TFilterData} values - текущие данные фильтра
*/
const setFilterData = async (values: TFilterData): Promise<THandledData<TFilterData>> => {
  let data = { isSucceed: false, data: null };

  const isFilterDataSet = (key: typeof FILTER_KEY) => sessionStorage.getItem(key) !== null;
  const setFilterParams = (key: typeof FILTER_KEY, payload: TFilterData) =>
    sessionStorage.setItem(
      key,
      JSON.stringify({
        ...payload,
        params: payload.data ? stringifyFilterData(payload.data) : "",
      })
    );

  if (isFilterDataSet(FILTER_KEY)) {
    removeStorageItem(FILTER_KEY);
    setFilterParams(FILTER_KEY, values);
  } else {
    setFilterParams(FILTER_KEY, values);
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      isFilterDataSet(FILTER_KEY)
        ? resolve({
            isSucceed: isFilterDataSet(FILTER_KEY),
            data: JSON.parse(sessionStorage.getItem(FILTER_KEY) as string),
          })
        : reject({ ...data });
    }, 200);
  });
};

/**
 * Создание выборки отделений по списку их id
 * @property {TItemData[]} currentItems - массив данных отделений банка
 * @property {string[]} arr - массив id отделений для ограниченной выборки
 * @returns {TItemData[]} массив, соответствующих идентификаторам, отделений
*/
const setSelectedItems = (currentItems: TItemData[], arr: string[] = []): TItemData[] => {
  if (!arr.length) {
    return [];
  }

  return arr.reduce((acc: TItemData[], item) => {
    const data = currentItems.find(({ id }) => id && id === item);

    return data ? [...acc, data] : acc;
  }, []);
};

/**
 * Изменяет позицию на карте после получения данных по id местоположения
 * @property {string} id - id геолокации
*/
const changeLocation = async (id: string): Promise<{ data: TLocationData | null; }> => {
  let data: { data: TLocationData | null; } = { data: null };
  const location_id = id || DEFAULT_LOC_ID;

  try {
    /*
    // TODO: создать эндпойнт для получения данных геолокации по id
    const { data: selectedLocationData } = await axios.post(
      `${GEO_SWITCHER_URL}?id=${location_id}`
    );
    */
    const res = await fetchFilterData();
    const selectedLocationData = [...res.cities as TDeptsData['cities']].find((item) => item.ID === id);

    if (selectedLocationData) {
      const payload = handleLocationItem(selectedLocationData);
      const { data: locationData } = await setLocation(payload);

      data = { data: locationData };
    } else {
      console.error(
        `Путь ${GEO_SWITCHER_URL}?id=${location_id} возвращает некорректное значение`
      );
    }
  } catch (error) {
    console.error(error);
  }

  return data;
};

export {
  removeStorageItem,
  setLocation,
  setFilterData,
  handleLocationData,
  handleLocationItem,
  handlePointsData,
  stringifyFilterData,
  setSelectedItems,
  changeLocation,
};
