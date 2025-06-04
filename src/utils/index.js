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

import axios from "axios";

const stringifyFilterData = (data) =>
  Object.keys(data).reduce(
    (acc, item, index) =>
      acc + `${index === 0 ? "?" : "&"}${item}=${Object.values(data)[index]}`,
    ""
  );

const handlePointsData = async ({ key, request, boundedBy }) => {
  let data = { isSucceed: false, data: null };

  try {
    const ymapsRes = await new Promise((resolve) => ymaps.ready(resolve));
    const searchRes = await ymapsRes.search(request, {
      results: 10000,
      boundedBy,
    });
    const resultsArr = searchRes.geoObjects.properties.get("resultsArray");

    data = {
      isSucceed: true,
      data: resultsArr.map((item) => ({
        key,
        id: item.properties.get("id"),
        name: item.properties.get("name"),
        address: item.properties.get("address"),
        phone: item.properties.get("phoneNumbers"),
        workingStatus: item.properties.get("workingStatus"),
        workMode: [item.properties.get("workingTime")],
        coords: item.geometry.getCoordinates(),
      })),
    };
  } catch (error) {
    console.error(error);
  }

  console.log("handlePointsData: ", data);

  return data;
};

const handleLocationData = async ({ value, code }) => {
  let data = { isSucceed: false, data: null };

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

const handleLocationItem = (data) => {
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

const removeStorageItem = (key = LOCATION_KEY) => {
  sessionStorage.removeItem(key);
};

const handleCurrentLocation = (arr) => {
  const selectedLocation = document.querySelector(GEO_NAME_SEL);
  const defaultLocationData = {
    [LOCATION_KEY]: DEFAULT_LOC,
    [LOCATION_CODE_KEY]: DEFAULT_LOC_CODE,
    coords: DEFAULT_COORDS,
    boundedBy: DEFAULT_BOUNDS,
  };

  if (
    !selectedLocation ||
    (selectedLocation && !selectedLocation.textContent)
  ) {
    return defaultLocationData;
  }

  const selectedLocationCaption = selectedLocation.textContent.toLowerCase();
  const data = arr.find(
    (item) =>
      item[LOCATION_KEY].toLowerCase() === selectedLocationCaption.trim()
  );

  return data || defaultLocationData;
};

const setLocation = async (values) => {
  let data = { isSucceed: false, data: null };

  const isLocationSet = (key) => localStorage.getItem(key) !== null;
  const setLocationData = (key, data) =>
    localStorage.setItem(key, JSON.stringify(data));

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
            data: JSON.parse(localStorage.getItem(LOCATION_KEY)),
          })
        : reject({ ...data });
    }, 200);
  });
};

const setFilterData = async (values) => {
  let data = { isSucceed: false, data: null };

  const isFilterDataSet = (key) => sessionStorage.getItem(key) !== null;
  const setFilterParams = (key, payload) =>
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
            data: JSON.parse(sessionStorage.getItem(FILTER_KEY)),
          })
        : reject({ ...data });
    }, 200);
  });
};

const setSelectedItems = (currentItems, arr = []) => {
  if (!arr.length) {
    return [];
  }

  return arr.map((item) => currentItems.find(({ id }) => id === item));
};

const changeLocation = async (id) => {
  let data = null;
  const location_id = id || DEFAULT_LOC_ID;
  const selectedLocation = document.querySelector(GEO_NAME_SEL);

  try {
    const { data: selectedLocationData } = await axios.post(
      `${GEO_SWITCHER_URL}?id=${location_id}`
    );

    if (selectedLocationData) {
      const payload = handleLocationItem(selectedLocationData);
      const { data: locationData } = await setLocation(payload);

      data = { data: locationData };

      // TODO: вынести эту конструкцию из приложения
      if (selectedLocation)
        selectedLocation.textContent = locationData[LOCATION_KEY];
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
  handleCurrentLocation,
  handlePointsData,
  stringifyFilterData,
  setSelectedItems,
  changeLocation,
};
