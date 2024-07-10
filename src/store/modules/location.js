import { defineStore, setActivePinia } from 'pinia';
import { piniaStore } from '../index';
import { useCategoryStore } from './category';
import { setLocation } from '../../utils';
import { POINT_KEY, LOCATION_KEY, LOCATION_CODE_KEY, FILTER_KEY, DEFAULT_LOC, DEFAULT_LOC_CODE, DEFAULT_COORDS, DEFAULT_BOUNDS, API_URL } from '../../utils/constants';

import { fetchFilterData } from '../../utils/fetchFilterData';
//import axios from 'axios';

setActivePinia(piniaStore);
const categoryStore = useCategoryStore();

const useLocationStore = defineStore({
  id: 'location',
  state: () => ({
    locationList: [],
    currentLocation: null
  }),
  actions: {
    async setLocationList(category) {
      categoryStore.isCategoryListLoading = true;

      if(category === POINT_KEY) {
        categoryStore.isCategoryListLoading = false;
        return;
      }

      try {
        const data = await fetchFilterData();
        //const { data } = await axios.get(`${API_URL}${FILTER_KEY}/`);
        //console.log({data});

        if(data) {
          categoryStore.categoryFilterData = data;

          this.locationList = data.cities.map(({
            UF_NAME,
            UF_XML_ID,
            UF_LATITUDE,
            UF_LONGITUDE,
            UF_RANGE_LOW_LAT,
            UF_RANGE_LOW_LNG,
            UF_RANGE_UP_LAT,
            UF_RANGE_UP_LNG,
            UF_TOP
          }) => {
            const [coords, leftBottom, rightTop] = [
              [UF_LATITUDE, UF_LONGITUDE],
              [UF_RANGE_LOW_LAT, UF_RANGE_LOW_LNG],
              [UF_RANGE_UP_LAT, UF_RANGE_UP_LNG]
            ].map(item => [Number(item[0]), Number(item[1])]);

            return {
              [LOCATION_KEY]: UF_NAME,
              [LOCATION_CODE_KEY]: UF_XML_ID,
              coords,
              boundedBy: [leftBottom, rightTop],
              isPopular: Boolean(UF_TOP)
            }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        categoryStore.isCategoryListLoading = false;
      }
    },
    async setCurrentLocation(arr, value = '') {
      const locationData = localStorage.getItem(LOCATION_KEY);
      const currentLocationData = locationData ? JSON.parse(locationData) : null;
      const locationItemData = value
        ? arr.find(data => data[LOCATION_CODE_KEY] === value)
        : {
          [LOCATION_KEY]: DEFAULT_LOC,
          [LOCATION_CODE_KEY]: DEFAULT_LOC_CODE,
          coords: DEFAULT_COORDS,
          boundedBy: DEFAULT_BOUNDS
        };

      if(!value && locationData) {
        this.currentLocation = currentLocationData;
        return;
      }

      try {
        const { isSucceed, data } = await setLocation(locationItemData);

        if(isSucceed) {
          this.currentLocation = data;
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
});

export {
  useLocationStore
}
