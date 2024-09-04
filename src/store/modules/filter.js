import { defineStore, setActivePinia } from "pinia";
import { piniaStore } from "../index";
import { useCategoryStore } from "./category";
import { setLocation, setFilterData } from "../../utils";
import {
  FILIAL_KEY,
  ATM_KEY,
  POINT_KEY,
  TERMINAL_KEY,
  LOCATION_KEY,
  LOCATION_CODE_KEY,
  FILTER_KEY,
  DEFAULT_LOC,
  DEFAULT_LOC_CODE,
  DEFAULT_COORDS,
  DEFAULT_BOUNDS,
  API_URL,
} from "../../utils/constants";

import { fetchFilterData } from '../../utils/fetchFilterData';
//import axios from "axios";

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
      { type: POINT_KEY, caption: "Точки погашения", category: "Точка погашения" },
      { type: TERMINAL_KEY, caption: "Терминалы", category: "Терминал" },
    ],
    currentCategory: null,
    categoryFilterData: null,
    currentFilterData: null,
  }),
  actions: {
    getStorageData(key) {
      const storageData = key === FILTER_KEY
        ? sessionStorage.getItem(key)
        : localStorage.getItem(key);
      const data = storageData ? JSON.parse(storageData) : null;

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            isSucceed: true,
            data
          })
        }, 200);
      });
    },
    updateFilterData(locationData, filterData) {
      this.currentLocation = locationData;
      this.currentFilterData = filterData;
      this.currentCategory = this.categoryList.find(({ type }) => type === filterData.type);
    },
    async initFilter() {
      const defaultLocationData = {
        [LOCATION_KEY]: DEFAULT_LOC,
        [LOCATION_CODE_KEY]: DEFAULT_LOC_CODE,
        coords: DEFAULT_COORDS,
        boundedBy: DEFAULT_BOUNDS,
      };
      const defaultFilterData = {
        [LOCATION_KEY]: DEFAULT_LOC,
        [LOCATION_CODE_KEY]: DEFAULT_LOC_CODE,
        type: this.categoryList[0].type,
        data: null
      };

      try {
        const [
          { data: currentLocationData },
          { data: currentFilterData }
        ] = await Promise.all([
          this.getStorageData(LOCATION_KEY),
          this.getStorageData(FILTER_KEY)
        ]);
        const currentData = [currentLocationData, currentFilterData].filter(data => Boolean(data));

        if (currentData.length === 0) {
          const [
            { data: locationData },
            { data: filterData }
          ] = await Promise.all([
            setLocation(defaultLocationData),
            setFilterData(defaultFilterData)
          ]);

          if ([locationData, filterData].reduce((acc, item) => acc && Boolean(item), true)) {
            this.updateFilterData(locationData, filterData);
          };
        } else {
          this.updateFilterData(currentLocationData, currentFilterData);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async setLocationList() {
      categoryStore.isCategoryListLoading = true;

      try {
        const data = await fetchFilterData();
        //const { data } = await axios.get(`${API_URL}${FILTER_KEY}/`);
        //console.log({ data });

        if (data) {
          const filterKeys = this.categoryList.map(({ type }) => type);

          this.categoryFilterData = filterKeys.reduce(
            (acc, key) => (data[key] ? { ...acc, [key]: data[key] } : acc),
            {}
          );
          this.locationList = data.cities.map(
            ({
              UF_NAME,
              UF_XML_ID,
              UF_LATITUDE,
              UF_LONGITUDE,
              UF_RANGE_LOW_LAT,
              UF_RANGE_LOW_LNG,
              UF_RANGE_UP_LAT,
              UF_RANGE_UP_LNG,
              UF_TOP,
            }) => {
              const [coords, leftBottom, rightTop] = [
                [UF_LATITUDE, UF_LONGITUDE],
                [UF_RANGE_LOW_LAT, UF_RANGE_LOW_LNG],
                [UF_RANGE_UP_LAT, UF_RANGE_UP_LNG],
              ].map((item) => [Number(item[0]), Number(item[1])]);

              return {
                [LOCATION_KEY]: UF_NAME,
                [LOCATION_CODE_KEY]: UF_XML_ID,
                coords,
                boundedBy: [leftBottom, rightTop],
                isPopular:
                  UF_TOP === null ? Boolean(UF_TOP) : Boolean(Number(UF_TOP)),
              };
            }
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

      const currentLocationData = this.locationList.find((item) => item[LOCATION_CODE_KEY] === data[LOCATION_CODE_KEY]);

      try {
        const [
          { data: locationData },
          { data: filterData }
        ] = await Promise.all([
          setLocation(currentLocationData),
          setFilterData({
            ...this.currentFilterData,
            [LOCATION_KEY]: data[LOCATION_KEY],
            [LOCATION_CODE_KEY]: data[LOCATION_CODE_KEY]
          })
        ]);

        if ([locationData, filterData].reduce((acc, item) => acc && Boolean(item), true)) {
          this.updateFilterData(locationData, filterData);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async setCurrentFilterData(data) {
      try {
        const [
          { data: locationData },
          { data: filterData }
        ] = await Promise.all([
          setLocation(this.currentLocation),
          setFilterData({
            ...data,
            [LOCATION_KEY]: this.currentLocation[LOCATION_KEY],
            [LOCATION_CODE_KEY]: this.currentLocation[LOCATION_CODE_KEY]
          })
        ]);

        if ([locationData, filterData].reduce((acc, item) => acc && Boolean(item), true)) {
          this.updateFilterData(locationData, filterData);
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
});

export { useFilterStore };
