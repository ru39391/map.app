import { defineStore } from 'pinia';
import { setLocation } from '../../utils';
import { LOCATION_KEY } from '../../utils/constants';

const useLocationStore = defineStore({
  id: 'location',
  state: () => ({
    locationList: [],
    locationResultList: null,
    currentLocation: null
  }),
  actions: {
    setLocationList(arr) {
      const rawLocationList = arr.reduce(
        (acc, { address }) => {
          if(address.includes('г.') || address.includes('ст.')) {
            const addressValue = address.includes('г.') ? address.split('г.')[1] :  address.split('ст.')[1];

            return [...acc, addressValue.split(',')[0].trim()];
          } else {
            return acc;
          }
        }, []
      );
      const locationList = rawLocationList.reduce(
        (acc, item) => acc.find(value => value === item) ? acc : [...acc, item], []
      );
      const locationDataList = locationList.map(location => (
        {
          location,
          value: rawLocationList.filter(item => item === location).length
        }
      ));

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
        const { isSucceed, data } = await setLocation(value || 'Москва');

        if(isSucceed) {
          this.currentLocation = data;
        }
      } catch (error) {
        console.log(error);
      }
    }
  },
});

export {
  useLocationStore
}
