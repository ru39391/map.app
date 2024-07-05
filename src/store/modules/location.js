import { defineStore, setActivePinia } from 'pinia';
import { piniaStore } from '../index';
import { useCategoryStore } from './category';
import { setLocation } from '../../utils';
import { POINT_KEY, LOCATION_KEY, LOCATION_CODE_KEY, FILTER_KEY, DEFAULT_LOC, DEFAULT_LOC_CODE, API_URL } from '../../utils/constants';

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
      if(category === POINT_KEY) {
        return;
      }

      try {
        const data = await fetchFilterData();
        //const data = await axios.get(`${API_URL}${FILTER_KEY}/`);
        console.log({data});

        if(data) {
          categoryStore.filterList = data[category];
        }

        if(data.cities.length) {
          this.locationList = data.cities.map(({
            UF_NAME,
            UF_XML_ID,
            UF_LATITUDE,
            UF_LONGITUDE,
            UF_RANGE_LOW_LAT,
            UF_RANGE_LOW_LNG,
            UF_RANGE_UP_LAT,
            UF_RANGE_UP_LNG
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
              boundedBy: [leftBottom, rightTop]
            }
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    async setCurrentLocation(value = '') {
      const locationData = localStorage.getItem(LOCATION_KEY);
      const currentLocationData = locationData ? JSON.parse(locationData) : null;
      const locationItemData = value ? this.locationList.find(data => data[LOCATION_KEY] === value) : {[LOCATION_CODE_KEY]: DEFAULT_LOC_CODE};

      if(!value && locationData) {
        this.currentLocation = currentLocationData;
        return;
      }

      try {
        const { isSucceed, data } = await setLocation({
          value: value || DEFAULT_LOC,
          code: locationItemData ? locationItemData[LOCATION_CODE_KEY] : DEFAULT_LOC_CODE
        });

        if(isSucceed) {
          this.currentLocation = data;
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
});

export {
  useLocationStore
}
