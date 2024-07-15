import { defineStore } from 'pinia';
import {
  PARTNER_NAME,
  FILIAL_KEY,
  ATM_KEY,
  POINT_KEY,
  TERMINAL_KEY,
  LOCATION_KEY,
  LOCATION_CODE_KEY,
  API_URL
} from '../../utils/constants';

import { fetchersData, handleLocationList, handlePointsData } from '../../utils';
//import axios from 'axios';

const useCategoryStore = defineStore({
  id: 'category',
  state: () => ({
    isCategoryListLoading: false,
    currentItemsList: [],
    selectedItemsList: [],
    categoryList: [
      {type: FILIAL_KEY, caption: 'Отделения', category: 'Филиал'},
      {type: ATM_KEY, caption: 'Банкоматы', category: 'Банкомат'},
      {type: POINT_KEY, caption: 'Точки погашения кредита', category: 'Точка погашения кредита'},
      {type: TERMINAL_KEY, caption: 'Терминалы', category: 'Терминал'}
    ],
    currentCategory: null,
    categoryFilterData: null,
  }),
  actions: {
    async fetchCategoryData(data, params = '') {
      this.currentItemsList = [];
      this.isCategoryListLoading = true;

      if(data.type === POINT_KEY) {
        this.isCategoryListLoading = false;
        return;
      }

      const requestUrl = `${API_URL}${data.type}${params ? `${params}&HL_CITY=${data[LOCATION_CODE_KEY]}` : `?HL_CITY=${data[LOCATION_CODE_KEY]}`}`

      try {
        const {data: itemsData, success} = await fetchersData[data.type]();
        //const { data: itemsData } = await axios.get(requestUrl);
        //console.log({itemsData});

        if(success) {
        //if (itemsData.success) {
          const items = itemsData.map(data => {
            const {
              name,
              address,
              lon,
              lat,
              workMode,
              workTime
            } = {
              name: data.name,
              address: data.address,
              lon: data.lon,
              lat: data.lat,
              workMode: data.work_mode,
              workTime: data.work_time
            };
            const workModeArr = workMode.split('<br/><b>');

            return {
              ...data,
              name: name.replace(/&quot;/g, ''),
              address: address.replace(/&quot;/g, ''),
              isPartner: name === PARTNER_NAME,
              workMode: workModeArr.map(item => item.replace(/<[^>]*>/g, '')).filter(item => item),
              ...(lon && lat && { coords: [lon, lat].map(value => Number(value)) }),
              ...(workTime && { workingStatus: { isWork: workTime.color === 'blue', time: workTime.title } }),
            };
          });

          this.currentItemsList = items;
        }
      } catch (error) {
        console.error(error);
      } finally {
        console.log({requestUrl});
        this.isCategoryListLoading = false;
      }
    },
    async fetchPointsData(data) {
      const paramsArr = Object.values(data).filter(({ checked }) => checked);

      this.currentItemsList = [];
      this.isCategoryListLoading = true;

      try {
        const resultArr = await Promise.all(
          paramsArr.map(({ key, request, boundedBy }) => handlePointsData({ key, request, boundedBy }))
        );

        this.currentItemsList = resultArr.reduce((acc, item) => Object.values(item)[0] ? [...acc, ...Object.values(item)[1]] : acc, []);
      } catch (error) {
        console.error(error);
      } finally {
        this.isCategoryListLoading = false;
      }
    },
    setCurrentItemsList(data) {
      const { arr, category } = data;

      if(category === POINT_KEY) {
        this.currentItemsList = arr;
        return;
      }

      const currentItemsArr = handleLocationList(arr, 'id').filter(item => item[LOCATION_KEY] === data[LOCATION_KEY]);

      this.currentItemsList = arr.reduce((acc, item) => currentItemsArr.find(({ id }) => id === item.id) ? [...acc, item] : acc, []);
    },
    setSelectedItemsList(arr = []) {
      if(!arr.length) {
        this.selectedItemsList = [];
        return;
      }

      this.selectedItemsList = arr.map(item => this.currentItemsList.find(({ id }) => id == item));
    },
    setCurrentCategory(data) {
      this.currentCategory = data;
    }
  },
});

export {
  useCategoryStore
}
