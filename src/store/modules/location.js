import { defineStore } from 'pinia';
import { setLocation, handleLocationList } from '../../utils';
import { POINT_KEY, LOCATION_KEY, LOCATION_CODE_KEY, DEFAULT_LOC, DEFAULT_LOC_CODE, DEFAULT_COORDS } from '../../utils/constants';

const useLocationStore = defineStore({
  id: 'location',
  state: () => ({
    locationList: [],
    currentLocation: null
  }),
  actions: {
    async setLocationList(arr) {
      this.locationList = arr.map(
        ({ UF_NAME: location, UF_XML_ID: locationCode }) => ({ location, locationCode })
      );
      console.log(this.locationList);
      /*
      if(category === POINT_KEY) {
        return;
      }

      const locationArr = handleLocationList(arr).reduce(
        (acc, item) => acc.find(value => value === item) ? acc : [...acc, item], []
      );
      const locationDataList = locationArr.map(location => ({
        location,
        value: handleLocationList(arr).filter(item => item === location).length
      }));

      this.locationList = locationDataList.sort((a, b) => {
        const paramA = a.value;
        const paramB = b.value;

        if(paramA < paramB) {
          return 1;
        }
        if(paramA > paramB) {
          return -1;
        }
        return 0;
      });
      */
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
