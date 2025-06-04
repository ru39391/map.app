import { defineStore, setActivePinia } from "pinia";
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

setActivePinia(piniaStore);

const categoryStore = useCategoryStore();

const useFilterStore = defineStore({
  id: "filter",
  state: () => ({
    locationList: [],
    currentLocation: null,
    categoryList: [
      { type: FILIAL_KEY, caption: "Отделения", category: "Филиал" },
      { type: ATM_KEY, caption: "Банкоматы", category: "Банкомат" },
      { type: TERMINAL_KEY, caption: "Терминалы", category: "Терминал" },
      {
        type: POINT_KEY,
        caption: "Точки погашения",
        category: "Точка погашения",
      },
    ],
    currentCategory: null,
    categoryFilterData: null,
    currentFilterData: null,
  }),
  actions: {
    getStorageData(key) {
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
    },
    updateFilterData(locationData, filterData) {
      this.currentLocation = locationData;
      this.currentFilterData = filterData;
      this.currentCategory = this.categoryList.find(
        ({ type }) => type === filterData.type
      );
    },
    async initFilter() {
      const defaultFilterData = {
        [LOCATION_KEY]: DEFAULT_LOC,
        [LOCATION_CODE_KEY]: DEFAULT_LOC_CODE,
        type: this.categoryList[0].type,
        data: null,
      };

      try {
        const [{ data: currentLocationData }, { data: currentFilterData }] =
          await Promise.all([
            this.getStorageData(LOCATION_KEY),
            this.getStorageData(FILTER_KEY),
          ]);
        const currentData = [currentLocationData, currentFilterData].filter(
          (data) => Boolean(data)
        );

        if (currentData.length === 2) {
          this.updateFilterData(currentLocationData, currentFilterData);
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
            this.updateFilterData(locationData, filterData);
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    async setLocationList() {
      categoryStore.isCategoryListLoading = true;

      try {
        const { data } = await axios.get(`${API_URL}${FILTER_KEY}/`);

        if (data) {
          const filterKeys = this.categoryList.map(({ type }) => type);

          this.categoryFilterData = filterKeys.reduce(
            (acc, key) => (data[key] ? { ...acc, [key]: data[key] } : acc),
            {}
          );
          this.locationList = data.cities.map((item) =>
            handleLocationItem(item)
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        categoryStore.isCategoryListLoading = false;
      }
    },
    async setCurrentLocation(data) {
      if (this.currentLocation[LOCATION_CODE_KEY] === data[LOCATION_CODE_KEY]) {
        return;
      }

      const currentLocationData = this.locationList.find(
        (item) => item[LOCATION_CODE_KEY] === data[LOCATION_CODE_KEY]
      );

      try {
        const [{ data: locationData }, { data: filterData }] =
          await Promise.all([
            changeLocation(currentLocationData[LOCATION_ID_KEY]),
            setFilterData({
              ...this.currentFilterData,
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
          this.updateFilterData(locationData, filterData);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async setCurrentFilterData(data) {
      try {
        const [{ data: locationData }, { data: filterData }] =
          await Promise.all([
            setLocation(this.currentLocation),
            setFilterData({
              ...data,
              [LOCATION_KEY]: this.currentLocation[LOCATION_KEY],
              [LOCATION_CODE_KEY]: this.currentLocation[LOCATION_CODE_KEY],
              [COORDS_KEY]: this.currentLocation[COORDS_KEY],
            }),
          ]);

        if (
          [locationData, filterData].reduce(
            (acc, item) => acc && Boolean(item),
            true
          )
        ) {
          this.updateFilterData(locationData, filterData);
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
});

export { useFilterStore };
