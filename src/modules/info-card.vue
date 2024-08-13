<template>
  <div class="info-card">
    <div class="info-card__header">
      <div class="info-card__category" v-if="currentCategory">
        {{ isPointsListVisible ? currentCategory.category : item.subname }}
      </div>
      <div class="info-card__caption">{{ item.name }}</div>
    </div>
    <div
      :class="[
        'info-card__wrapper',
        { 'info-card__wrapper_margin_bottom': !isPointsListVisible },
        {
          'info-card__wrapper_mb_none':
            !isCardFooterVisible || isPointsListVisible,
        },
      ]"
    >
      <div
        :class="[
          'info-card__item info-card__item_fw_bold info-card__work-time',
          {
            'info-card__item_color_primary':
              item.workingStatus && item.workingStatus.isWork,
          },
          {
            'info-card__item_color_danger':
              item.workingStatus && !item.workingStatus.isWork,
          },
        ]"
        v-if="item.workingStatus && !isTerminal && !isPointsListVisible"
      >
        <template v-if="isPointsListVisible">
          <template v-if="item.workingStatus.isWork">Открыто</template>
          <template v-else>Закрыто</template>

          <template v-if="item.workingStatus.time"> до </template>
        </template>

        <template v-if="item.workingStatus.time">{{
          item.workingStatus.time
        }}</template>
      </div>
      <div
        class="info-card__item info-card__item_fw_bold info-card__item_type_row info-card__address"
        :class="{ 'info-card__address--mt-16': isTerminal }"
      >
        {{ item.address }}
        <button
          class="info-card__item-toggler"
          type="button"
          @click="copyItemAddress(item.address)"
        >
          <CopyIcon />
        </button>
      </div>
      <div
        v-if="
          Array.isArray(item.workMode) &&
          item.workMode.length &&
          !isPointsListVisible
        "
        class="info-card__item info-card__item_fs_xs info-card__times"
      >
        <span v-for="(value, index) in item.workMode" :key="index">
          {{ value }}</span
        >
      </div>
      <div
        v-if="isTerminal || isAtm"
        class="info-card__content"
        v-html="item.content"
      ></div>
    </div>
    <!-- <button v-if="!isCardFooterVisible" class="info-card__toggler" type="button" @click="setSelectedItemsList([item.id])"></button> -->
    <a
      class="info-card__readmore"
      :href="`/retail/branches/detail.php?ID=${item.id}`"
      v-if="!isPointsListVisible"
    >
      <span>Подробнее</span>
      <ChevronRightIcon />
    </a>
    <a
      class="map-filter-btn map-filter-btn--mt-16"
      v-if="isCardFooterVisible && isDept && item.coords && item.coords.length"
      :href="`https://yandex.ru/maps/?rtext=~${item.coords[0].toString()},${item.coords[1].toString()}`"
      target="_blank"
    >
      маршрут от меня
    </a>
  </div>
</template>

<script>
import { mapActions } from "pinia";
import { useCategoryStore } from "../store/modules/category";
import {
  FILIAL_KEY,
  ATM_KEY,
  POINT_KEY,
  TERMINAL_KEY,
} from "../utils/constants";
import CopyIcon from "../assets/icons/copy-icon.vue";
import ExpendMoreIcon from "../assets/icons/expend-more-icon.vue";
import ChevronRightIcon from "../assets/icons/chevron-right-icon.vue";

export default {
  name: "info-card",

  components: {
    CopyIcon,
    ExpendMoreIcon,
    ChevronRightIcon,
  },

  data() {
    return {
      isCardFooterHidden: true,
      servicesDataList: [
        { key: "sb", caption: "Обслуживание малого и среднего бизнеса" },
        { key: "crp", caption: "Обслуживание корпоративных клиентов" },
        {
          key: "mobile_group",
          caption:
            "Отделение оборудовано средствами для доступа маломобильных групп населения",
        },
      ],
    };
  },

  props: {
    item: {
      type: Object,
      required: true,
    },
    currentCategory: {
      type: Object,
    },
    isCardFooterVisible: {
      type: Boolean,
    },
  },

  computed: {
    servicesList() {
      return (
        this.item &&
        this.servicesDataList.map(({ key, caption }) => ({
          value: this.item[key],
          caption,
        }))
      );
    },

    isServicesListExist() {
      return (
        (this.item && Array.isArray(this.item.fl) && this.item.fl.length) ||
        this.servicesDataList.reduce(
          (acc, { key }) => acc || Boolean(this.item[key]),
          false
        )
      );
    },

    isPointsListVisible() {
      return this.currentCategory && this.currentCategory.type === POINT_KEY;
    },

    isDept() {
      return this.currentCategory && this.currentCategory.type === FILIAL_KEY;
    },

    isAtm() {
      return this.currentCategory && this.currentCategory.type === ATM_KEY;
    },

    isTerminal() {
      return this.currentCategory && this.currentCategory.type === TERMINAL_KEY;
    },
  },

  methods: {
    ...mapActions(useCategoryStore, ["setSelectedItemsList"]),

    setCardFooterHidden() {
      this.isCardFooterHidden = !this.isCardFooterHidden;
    },

    async copyItemAddress(value) {
      try {
        await navigator.clipboard.writeText(value);

        console.log({ value });
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>
