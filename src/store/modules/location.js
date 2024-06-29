import { defineStore } from 'pinia';
import { setLocation, handleLocationList } from '../../utils';
import { LOCATION_KEY, DEFAULT_LOC } from '../../utils/constants';

const useLocationStore = defineStore({
  id: 'location',
  state: () => ({
    locationList: [],
    locationResultList: null,
    currentLocation: null
  }),
  actions: {
    setLocationList(arr) {
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
      })
    },
    setLocationResultList(value) {
    },
    async setCurrentLocation(value = '') {
      const locationData = localStorage.getItem(LOCATION_KEY);

      if(!value && locationData) {
        this.currentLocation = JSON.parse(locationData);
        return;
      }

      try {
        const { isSucceed, data } = await setLocation(value || DEFAULT_LOC);

        if(isSucceed) {
          this.currentLocation = data;
        }
      } catch (error) {
        console.error(error);
      }
    }
  },
});

export {
  useLocationStore
}
