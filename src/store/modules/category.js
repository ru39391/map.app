import { defineStore } from 'pinia';
import {
  FILIAL_KEY,
  ATM_KEY,
  POINT_KEY,
  TERMINAL_KEY
} from '../../utils/constants';

import { fetchersData } from '../../utils';
import { fetchFilterData } from '../../utils/fetchFilterData';

const useCategoryStore = defineStore({
  id: 'category',
  state: () => ({
    isCategoryListLoading: false,
    itemsList: [],
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
    async fetchCategoryData(key) {
      console.log({api: `/api/branches/${key}`});
      this.isCategoryListLoading = true;

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
