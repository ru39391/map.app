import { defineStore } from 'pinia';
import { setLocation, handleLocationList } from '../../utils';
import { POINT_KEY, LOCATION_KEY, DEFAULT_LOC, DEFAULT_COORDS } from '../../utils/constants';

const useLocationStore = defineStore({
  id: 'location',
  state: () => ({
    locationList: [],
    currentLocation: null,
    currentCoords: []
  }),
  actions: {
    setLocationList({ arr, category }) {
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
      })
    },
    async setCurrentLocation(value = '') {
      const locationData = localStorage.getItem(LOCATION_KEY);
      const currentLocationData = locationData ? JSON.parse(locationData) : null;

      if(!value && locationData) {
        this.currentLocation = currentLocationData;
        this.currentCoords = currentLocationData.coords;
        return;
      }

      try {
        const { isSucceed, data } = await setLocation(value || DEFAULT_LOC);

        if(isSucceed) {
          this.currentLocation = data;
          this.currentCoords = data.coords;
        }
      } catch (error) {
        console.error(error);
      }
    }
  },
  setCurrentCoords(arr) {
    this.currentCoords = arr;
  }
});

export {
  useLocationStore
}
