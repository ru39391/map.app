import { defineStore } from 'pinia';
import {
  FILIAL_KEY,
  ATM_KEY,
  POINT_KEY,
  TERMINAL_KEY,
  LOCATION_KEY
} from '../../utils/constants';

import { fetchersData, handleLocationList } from '../../utils';
import { fetchFilterData } from '../../utils/fetchFilterData';

const useCategoryStore = defineStore({
  id: 'category',
  state: () => ({
    isCategoryListLoading: false,
    itemsList: [],
    currentItemsList: [],
    currentRefsList: [],
    filterList: [],
    categoryList: [
      {type: FILIAL_KEY, caption: 'Отделения', category: 'Филиал'},
      {type: ATM_KEY, caption: 'Банкоматы', category: 'Банкомат'},
      {type: POINT_KEY, caption: 'Точки погашения кредита', category: ''},
      {type: TERMINAL_KEY, caption: 'Терминалы', category: 'Банкомат'}
    ],
    currentCategory: null,
    isCategoryDropdownOpen: false
  }),
  actions: {
    async fetchCategoryData(key, params = '') {
      console.log({params});
      console.log({api: `/api/branches/${key}${params}`});
      this.isCategoryListLoading = true;

      if(key === POINT_KEY) {
        this.itemsList = [];
        this.filterList = [];
        this.isCategoryListLoading = false;
        return;
      }

      try {
        const [ filtersData, {data: itemsArr, success} ] = await Promise.all([fetchFilterData(), fetchersData[key]()]);

        if(filtersData && success) {
          const items = itemsArr.map(data => {
            const {
              name,
              address,
              work_mode
            } = {
              name: data.name,
              address: data.address,
              work_mode: data.work_mode
            };
            const workModeArr = work_mode.split('<br/><b>');

            return {
              ...data,
              name: name.replace(/&quot;/g, ''),
              address: address.replace(/&quot;/g, ''),
              work_mode: workModeArr.map(item => item.replace(/<[^>]*>/g, '')).filter(item => item)
            };
          });

          this.itemsList = items;
          this.filterList = filtersData[key];
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.isCategoryListLoading = false;
      }
    },
    setCurrentItemsList(data) {
      const { arr } = data;
      const currentItemsArr = handleLocationList(arr, 'id').filter(item => item[LOCATION_KEY] === data[LOCATION_KEY]);

      this.currentItemsList = arr.reduce((acc, item) => currentItemsArr.find(({ id }) => id === item.id) ? [...acc, item] : acc, []);
    },
    setCurrentRefsList(arr) {
      this.currentRefsList = arr;
    },
    setCurrentCategory(data) {
      this.currentCategory = data;
    },
    setCategoryDropdownOpen(value) {
      this.isCategoryDropdownOpen = value;
    }
  },
});

export {
  useCategoryStore
}
