import { defineStore, setActivePinia } from "pinia";
import { piniaStore } from "../index";
import { useLocationStore } from "./location";
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

const locationStore = useLocationStore();

const useFilterStore = defineStore({
  id: "filter",
  state: () => ({
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
    async setCurrentLocation(value) {
      if (this.currentLocation[LOCATION_CODE_KEY] === value) {
        return;
      }

      const currentLocationData = locationStore.locationList.find((data) => data[LOCATION_CODE_KEY] === value);

      try {
        const [
          { data: locationData },
          { data: filterData }
        ] = await Promise.all([
          setLocation(currentLocationData),
          setFilterData({ ...this.currentFilterData, [LOCATION_CODE_KEY]: value })
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
          setFilterData({ ...data, [LOCATION_CODE_KEY]: this.currentLocation[LOCATION_CODE_KEY] })
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
