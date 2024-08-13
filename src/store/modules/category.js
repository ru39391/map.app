import { defineStore } from "pinia";
import {
  PARTNER_NAME,
  FILIAL_KEY,
  ATM_KEY,
  POINT_KEY,
  TERMINAL_KEY,
  LOCATION_KEY,
  LOCATION_CODE_KEY,
  API_URL,
  FILTER_KEY,
} from "../../utils/constants";

import {
  fetchersData,
  handleLocationList,
  handlePointsData,
  setFilterData,
} from "../../utils";
//import axios from 'axios';

const useCategoryStore = defineStore({
  id: "category",
  state: () => ({
    isCategoryListLoading: false,
    currentItemsList: [],
    selectedItemsList: [],
    categoryList: [
      { type: FILIAL_KEY, caption: "Отделения", category: "Филиал" },
      { type: ATM_KEY, caption: "Банкоматы", category: "Банкомат" },
      {
        type: POINT_KEY,
        caption: "Точки погашения",
        category: "Точка погашения",
      },
      { type: TERMINAL_KEY, caption: "Терминалы", category: "Терминал" },
    ],
    currentCategory: null,
    categoryFilterData: null,
    currentFilterData: null,
  }),
  actions: {
    async fetchCategoryData(data, params = "") {
      this.currentItemsList = [];
      this.isCategoryListLoading = true;

      if (data.type === POINT_KEY) {
        this.isCategoryListLoading = false;
        return;
      }

      const requestUrl = `${API_URL}${data.type}${
        params
          ? `/${params}&HL_CITY=${data[LOCATION_CODE_KEY]}`
          : `/?HL_CITY=${data[LOCATION_CODE_KEY]}`
      }`;

      try {
        /*
        const [{ data: itemsData, success }, { isSucceed, data: filterData }] =
          await Promise.all([
            fetchersData[data.type](),
            setFilterData({ ...data, params }),
          ]);
        */
        //axios.get(requestUrl),
        //console.log({itemsData});
        //console.log({ filterData });
        const { data: itemsData, success } = await fetchersData[data.type]();

        if (success) {
          //if (itemsData.success) {
          //const items = itemsData.data.map((data) => {
          const items = itemsData.map((data) => {
            const { name, address, lon, lat, workMode, workTime } = {
              name: data.name,
              address: data.address,
              lon: data.lon,
              lat: data.lat,
              workMode: data.work_mode,
              workTime: data.work_time,
            };
            const workModeArr = workMode.split("<br/><b>");

            return {
              ...data,
              name: name.replace(/&quot;/g, ""),
              address: address.replace(/&quot;/g, ""),
              isPartner: name === PARTNER_NAME,
              workMode: workModeArr
                .map((item) => item.replace(/<[^>]*>/g, ""))
                .filter((item) => item),
              ...(lon &&
                lat && { coords: [lon, lat].map((value) => Number(value)) }),
              ...(workTime && {
                workingStatus: {
                  isWork: workTime.color === "blue",
                  time: workTime.title,
                },
              }),
            };
          });

          this.currentItemsList = items;
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.isCategoryListLoading = false;
      }
    },
    async fetchPointsData(data) {
      const paramsArr = Object.values(data).filter(({ checked }) => checked);

      this.currentItemsList = [];
      this.isCategoryListLoading = true;

      try {
        const resultArr = await Promise.all(
          paramsArr.map(({ key, request, boundedBy }) =>
            handlePointsData({ key, request, boundedBy })
          )
        );

        this.currentItemsList = resultArr.reduce(
          (acc, item) =>
            Object.values(item)[0] ? [...acc, ...Object.values(item)[1]] : acc,
          []
        );
      } catch (error) {
        console.error(error);
      } finally {
        this.isCategoryListLoading = false;
      }
    },
    setCurrentItemsList(data) {
      const { arr, category } = data;

      if (category === POINT_KEY) {
        this.currentItemsList = arr;
        return;
      }

      const currentItemsArr = handleLocationList(arr, "id").filter(
        (item) => item[LOCATION_KEY] === data[LOCATION_KEY]
      );

      this.currentItemsList = arr.reduce(
        (acc, item) =>
          currentItemsArr.find(({ id }) => id === item.id)
            ? [...acc, item]
            : acc,
        []
      );
    },
    setSelectedItemsList(arr = []) {
      if (!arr.length) {
        this.selectedItemsList = [];
        return;
      }

      this.selectedItemsList = arr.map((item) =>
        this.currentItemsList.find(({ id }) => id == item)
      );
    },
    setCurrentCategory(data) {
      this.currentCategory = data;
    },
    saveSessionCategory(data) {
      return;
      const savedString = JSON.stringify(data);
      window.sessionStorage.setItem("currentMapCategory", savedString);
    },
    setSessionCategory() {
      return;
      const savedString = window.sessionStorage.getItem("currentMapCategory");

      if (savedString) {
        const categoryData = JSON.parse(savedString);
        this.currentCategory = categoryData;
      }
    },
    async setCurrentFilterData(payload = null) {
      const { type, data } = {
        type: payload ? payload.type : '',
        data: payload ? payload.data : null
      };
      const filterData = sessionStorage.getItem(FILTER_KEY);
      const currentFilterData = filterData
        ? JSON.parse(filterData)
        : null;
      const filterItemData = type
        ? { type, data }
        : { type: this.categoryList[0].type, data: null };

      if (!type && filterData) {
        this.currentFilterData = currentFilterData;
        return;
      }

      try {
        const { isSucceed, data } = await setFilterData(filterItemData);

        console.log({ isSucceed, data });

        if (isSucceed) {
          this.currentFilterData = data;
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
});

export { useCategoryStore };
