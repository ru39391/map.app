import { defineStore } from "pinia";
import { ref } from "vue";
import {
  PARTNER_NAME,
  POINT_KEY,
  API_URL,
  ATM_KEY,
  FILIAL_KEY,
  TERMINAL_KEY,
} from "../../utils/constants";

import { setSelectedItems, handlePointsData } from "../../utils";
import axios from "axios";

import { fetchAtmData } from "../../utils/fetchAtmData";
import { fetchFilialData } from "../../utils/fetchFilialData";
import { fetchTerminalData } from "../../utils/fetchTerminalData";

const types = {
  [ATM_KEY]: fetchAtmData(),
  [FILIAL_KEY]: fetchFilialData(),
  [TERMINAL_KEY]: fetchTerminalData(),
};

const useCategoryStore = defineStore("category", () => {
  const isCategoryListLoading = ref<boolean>(false);
  const currentItemsList = ref<Record<string, string>[]>([]);
  const selectedItemsList = ref<Record<string, string>[]>([]);
  const customItemsList = ref<Record<string, string>[]>([]);

  const fetchCategoryData = async (data, params = "") => {
    isCategoryListLoading.value = true;

    if (data.type === POINT_KEY) {
      isCategoryListLoading.value = false;
      return;
    }

    const requestUrl = `${API_URL}${data.type}/${params}`;
    console.log({ requestUrl });

    try {
      //const { data: itemsData } = await axios.get(requestUrl);
      const itemsData = await types[data.type];
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

        currentItemsList.value = items;
      }
    } catch (error) {
      console.error(error);
    } finally {
      isCategoryListLoading.value = false;
    }
  };

  const fetchPointsData = async (data) => {
    const paramsArr = Object.values(data).filter(({ checked }) => checked);

    currentItemsList.value = [];
    isCategoryListLoading.value = true;

    try {
      const resultArr = await Promise.all(
        paramsArr.map(({ key, request, boundedBy }) =>
          handlePointsData({ key, request, boundedBy })
        )
      );

      currentItemsList.value = resultArr.reduce(
        (acc, item) =>
          Object.values(item)[0] ? [...acc, ...Object.values(item)[1]] : acc,
        []
      );
    } catch (error) {
      console.error(error);
    } finally {
      isCategoryListLoading.value = false;
    }
  };

  const setSelectedItemsList = (arr = []) => {
    selectedItemsList.value = setSelectedItems(currentItemsList.value, arr);
  };

  const setCustomItemsList = (arr = []) => {
    customItemsList.value = setSelectedItems(currentItemsList.value, arr);
  };

  return {
    currentItemsList,
    customItemsList,
    isCategoryListLoading,
    selectedItemsList,
    fetchCategoryData,
    fetchPointsData,
    setCustomItemsList,
    setSelectedItemsList
  };
});

export { useCategoryStore };
