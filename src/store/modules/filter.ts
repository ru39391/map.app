import { defineStore, setActivePinia } from "pinia";
import { ref } from "vue";
import { piniaStore } from "../index";
import { useCategoryStore } from "./category";
import {
  handleLocationItem,
  setLocation,
  setFilterData,
  changeLocation,
} from "../../utils";
import {
  FILIAL_KEY,
  ATM_KEY,
  POINT_KEY,
  TERMINAL_KEY,
  LOCATION_KEY,
  LOCATION_ID_KEY,
  LOCATION_CODE_KEY,
  COORDS_KEY,
  FILTER_KEY,
  DEFAULT_LOC,
  DEFAULT_LOC_CODE,
  DEFAULT_LOCATION_DATA,
  API_URL,
} from "../../utils/constants";

import axios from "axios";

import { fetchFilterData } from "../../utils/fetchFilterData";

setActivePinia(piniaStore);

const categoryStore = useCategoryStore();

const useFilterStore = defineStore("filter", () => {
  const locationList = ref<Record<string, string>[]>([]);
  const currentLocation = ref<Record<string, string> | null>(null);
  const categoryList = ref<Record<string, string>[]>([
    { type: FILIAL_KEY, caption: "Отделения", category: "Филиал" },
    { type: ATM_KEY, caption: "Банкоматы", category: "Банкомат" },
    { type: TERMINAL_KEY, caption: "Терминалы", category: "Терминал" },
    {
      type: POINT_KEY,
      caption: "Точки погашения",
      category: "Точка погашения",
    },
  ]);
  const currentCategory = ref<Record<string, string> | null>(null);
  const categoryFilterData = ref<Record<string, string> | null>(null);
  const currentFilterData = ref<Record<string, string> | null>(null);

  const getStorageData = (key) => {
    const storageData =
      key === FILTER_KEY
        ? sessionStorage.getItem(key)
        : localStorage.getItem(key);
    const data = storageData ? JSON.parse(storageData) : null;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          isSucceed: true,
          data,
        });
      }, 200);
    });
  };

  const updateFilterData = (locationData, filterData) => {
    currentLocation.value = locationData;
    currentFilterData.value = filterData;
    currentCategory.value = [...categoryList.value].find(
      ({ type }) => type === filterData.type
    );
  };

  const initFilter = async () => {
    const defaultFilterData = {
      [LOCATION_KEY]: DEFAULT_LOC,
      [LOCATION_CODE_KEY]: DEFAULT_LOC_CODE,
      type: categoryList.value[0].type,
      data: null,
    };

    try {
      const [{ data: currentLocationData }, { data: currentFilterData }] =
        await Promise.all([
          getStorageData(LOCATION_KEY),
          getStorageData(FILTER_KEY),
        ]);
      const currentData = [currentLocationData, currentFilterData].filter(
        (data) => Boolean(data)
      );

      if (currentData.length === 2) {
        updateFilterData(currentLocationData, currentFilterData);
      } else {
        const handledFilterData = currentLocationData
          ? {
              ...defaultFilterData,
              [LOCATION_KEY]: currentLocationData[LOCATION_KEY],
              [LOCATION_CODE_KEY]: currentLocationData[LOCATION_CODE_KEY],
            }
          : defaultFilterData;
        const [{ data: locationData }, { data: filterData }] =
          await Promise.all([
            setLocation(currentLocationData || DEFAULT_LOCATION_DATA),
            setFilterData(currentFilterData || handledFilterData),
          ]);

        if (
          [locationData, filterData].reduce(
            (acc, item) => acc && Boolean(item),
            true
          )
        ) {
          updateFilterData(locationData, filterData);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const setLocationList = async () => {
    categoryStore.isCategoryListLoading = true;

    try {
      //const { data } = axios.get(`${API_URL}${FILTER_KEY}/`);
      const data = await fetchFilterData();

      if (data) {
        const filterKeys = categoryList.value.map(({ type }) => type);

        categoryFilterData.value = filterKeys.reduce(
          (acc, key) => (data[key] ? { ...acc, [key]: data[key] } : acc),
          {}
        );
        locationList.value = data.cities.map((item) => handleLocationItem(item));
      }
    } catch (error) {
      console.error(error);
    } finally {
      categoryStore.isCategoryListLoading = false;
    }
  };

  const setCurrentLocation = async (data) => {
    if (currentLocation.value[LOCATION_CODE_KEY] === data[LOCATION_CODE_KEY]) {
      return;
    }

    const currentLocationData = locationList.value.find(
      (item) => item[LOCATION_CODE_KEY] === data[LOCATION_CODE_KEY]
    );

    try {
      const [{ data: locationData }, { data: filterData }] = await Promise.all([
        changeLocation(currentLocationData[LOCATION_ID_KEY]),
        setFilterData({
          ...currentFilterData.value,
          [LOCATION_KEY]: data[LOCATION_KEY],
          [LOCATION_CODE_KEY]: data[LOCATION_CODE_KEY],
          [COORDS_KEY]: data[COORDS_KEY],
        }),
      ]);

      if (
        [locationData, filterData].reduce(
          (acc, item) => acc && Boolean(item),
          true
        )
      ) {
        updateFilterData(locationData, filterData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const setCurrentFilterData = async (data) => {
    try {
      const [{ data: locationData }, { data: filterData }] = await Promise.all([
        setLocation(currentLocation.value),
        setFilterData({
          ...data,
          [LOCATION_KEY]: currentLocation.value[LOCATION_KEY],
          [LOCATION_CODE_KEY]: currentLocation.value[LOCATION_CODE_KEY],
          [COORDS_KEY]: currentLocation.value[COORDS_KEY],
        }),
      ]);

      if (
        [locationData, filterData].reduce(
          (acc, item) => acc && Boolean(item),
          true
        )
      ) {
        updateFilterData(locationData, filterData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    locationList,
    currentLocation,
    categoryList,
    currentCategory,
    categoryFilterData,
    currentFilterData,
    initFilter,
    setCurrentFilterData,
    setCurrentLocation,
    setLocationList
  };
});

export { useFilterStore };
