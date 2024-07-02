import { defineStore } from 'pinia';
import {
  FILIAL_KEY,
  ATM_KEY,
  POINT_KEY,
  TERMINAL_KEY,
  LOCATION_KEY
} from '../../utils/constants';

import { fetchersData, handleLocationList, handlePointsData } from '../../utils';
import { fetchFilterData } from '../../utils/fetchFilterData';

const useCategoryStore = defineStore({
  id: 'category',
  state: () => ({
    isCategoryListLoading: false,
    itemsList: [],
    currentItemsList: [],
    filterList: [],
    categoryList: [
      {type: FILIAL_KEY, caption: 'Отделения', category: 'Филиал'},
      {type: ATM_KEY, caption: 'Банкоматы', category: 'Банкомат'},
      {type: POINT_KEY, caption: 'Точки погашения кредита', category: 'Точка погашения кредита'},
      {type: TERMINAL_KEY, caption: 'Терминалы', category: 'Терминал'}
    ],
    currentItem: null,
    currentCategory: null,
  }),
  actions: {
    async fetchCategoryData(key, params = '') {
      this.itemsList = [];
      this.filterList = [];
      this.isCategoryListLoading = true;

      if(key === POINT_KEY) {
        this.isCategoryListLoading = false;
        return;
      }

      try {
        const [ filtersData, {data: itemsData, success} ] = await Promise.all([fetchFilterData(), fetchersData[key]()]);
        /*
        const [
          { data: filtersData },
          { data: itemsData }
        ] = await Promise.all([
          `${API_URL}${FILTER_KEY}/`,
          `${API_URL}${key}${params}`,
        ].map((url) => axios.get(url)));

        console.log({filtersData});
        console.log({itemsData});
        */

        if(filtersData && success) {
        //if (filtersData && itemsData.success) {
          const items = itemsData.map(data => {
            const {
              name,
              address,
              workMode
            } = {
              name: data.name,
              address: data.address,
              workMode: data.work_mode
            };
            const workModeArr = workMode.split('<br/><b>');

            return {
              ...data,
              name: name.replace(/&quot;/g, ''),
              address: address.replace(/&quot;/g, ''),
              workMode: workModeArr.map(item => item.replace(/<[^>]*>/g, '')).filter(item => item)
            };
          });

          this.itemsList = items;
          this.filterList = filtersData[key];
        }
      } catch (error) {
        console.error(error);
      } finally {
        console.log({params, api: `/api/branches/${key}${params}`});
        this.isCategoryListLoading = false;
      }
    },
    async fetchPointsData(data) {
      const paramsArr = Object.values(data).filter(({ checked }) => checked);

      this.itemsList = [];
      this.isCategoryListLoading = true;

      try {
        const resultArr = await Promise.all(
          paramsArr.map(({ key, request, boundedBy }) => handlePointsData({ key, request, boundedBy }))
        );

        this.itemsList =  resultArr.reduce((acc, item) => Object.values(item)[0] ? [...acc, ...Object.values(item)[1]] : acc, []);
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
    setCurrentItem(data) {
      this.currentItem = data;
    },
    setCurrentCategory(data) {
      this.currentCategory = data;
    }
  },
});

export {
  useCategoryStore
}
