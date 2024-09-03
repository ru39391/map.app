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
    categoryList: [
      { type: FILIAL_KEY, caption: "Отделения", category: "Филиал" },
      { type: ATM_KEY, caption: "Банкоматы", category: "Банкомат" },
      { type: POINT_KEY, caption: "Точки погашения", category: "Точка погашения" },
      { type: TERMINAL_KEY, caption: "Терминалы", category: "Терминал" },
    ],
    currentLocation: null,
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
        ] = await Promise.all([this.getStorageData(LOCATION_KEY), this.getStorageData(FILTER_KEY)]);
        const currentData = [currentLocationData, currentFilterData].filter(data => Boolean(data));

        if (currentData.length === 0) {
          console.log(0);
          const [
            { data: locationData },
            { data: filterData }
          ] = await Promise.all([setLocation(defaultLocationData), setFilterData(defaultFilterData)]);

          if([locationData, filterData].reduce((acc, item) => acc && Boolean(item), true)) {
            this.currentLocation = locationData;
            this.currentFilterData = filterData;
          };
        } else {
          console.log(1);
          this.currentLocation = currentLocationData;
          this.currentFilterData = currentFilterData;
        }
      } catch (error) {
        console.error(error);
      }
    }
  },
});

export { useFilterStore };
