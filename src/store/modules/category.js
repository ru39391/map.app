import { defineStore } from "pinia";
import { PARTNER_NAME, POINT_KEY, API_URL } from "../../utils/constants";

import { setSelectedItems, handlePointsData } from "../../utils";
import axios from "axios";

const useCategoryStore = defineStore({
  id: "category",
  state: () => ({
    isCategoryListLoading: false,
    currentItemsList: [],
    selectedItemsList: [],
    customItemsList: [],
  }),
  actions: {
    async fetchCategoryData(data, params = "") {
      this.isCategoryListLoading = true;

      if (data.type === POINT_KEY) {
        this.isCategoryListLoading = false;
        return;
      }

      const requestUrl = `${API_URL}${data.type}/${params}`;
      console.log({ requestUrl });

      try {
        const { data: itemsData } = await axios.get(requestUrl);
        //console.log({ itemsData });

        if (itemsData.success) {
          const items = itemsData.data.map((data) => {
            const {
              name,
              address,
              category,
              individual,
              lon,
              lat,
              workMode,
              workModeCom,
              workTime,
            } = {
              name: data.name,
              address: data.address,
              category: data.category,
              individual: data.individual,
              lon: data.lon,
              lat: data.lat,
              workMode: data.work_mode,
              workModeCom: data.work_mode_le,
              workTime: data.work_time,
            };
            const [workModeArr, workModeComArr] = [workMode, workModeCom].map(
              (item) => item.split("</p><p><span>")
            );

            return {
              ...data,
              name: name.replace(/&quot;/g, ""),
              address: address.replace(/&quot;/g, ""),
              individual: Boolean(individual),
              isPartner: name === PARTNER_NAME,
              workMode: workModeArr
                .map((item) => item.replace(/<[^>]*>/g, ""))
                .filter((item) => item),
              workModeCom: workModeComArr
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
    setSelectedItemsList(arr = []) {
      this.selectedItemsList = setSelectedItems(this.currentItemsList, arr);
    },
    setCustomItemsList(arr = []) {
      this.customItemsList = setSelectedItems(this.currentItemsList, arr);
    },
  },
});

export { useCategoryStore };
