<template>
  <div class="info-card">
    <div class="info-card__header">
      <div class="info-card__category" v-if="currentCategory">{{ isPointsListVisible ? currentCategory.category : item.subname }}</div>
      <div class="info-card__caption">{{ item.name }}</div>
    </div>
    <div
      :class="[
        'info-card__wrapper',
        { 'info-card__wrapper_margin_bottom': !isPointsListVisible },
        { 'info-card__wrapper_mb_none': !isCardFooterVisible || isPointsListVisible },
      ]"
    >
      <div
        :class="[
          'info-card__item info-card__item_fw_bold info-card__work-time',
          { 'info-card__item_color_primary': item.workingStatus && item.workingStatus.isWork && !item.individual },
          { 'info-card__item_color_danger': item.individual || (item.workingStatus && !item.workingStatus.isWork) },
        ]"
        v-if="isDept && (item.individual || item.workingStatus)"
      >
        <template v-if="false">
          <!-- isPointsListVisible -->
          <template v-if="item.workingStatus.isWork">Открыто</template>
          <template v-else>Закрыто</template>

          <template v-if="item.workingStatus.time"> до </template>
        </template>

        <template v-if="item.workingStatus.time && !item.individual">{{ item.workingStatus.time }}</template>
        <template v-if="item.individual">Физические лица не обслуживаются</template>
      </div>
      <div class="info-card__item info-card__item_type_row info-card__address">
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
        v-if="Array.isArray(item.workMode) && item.workMode.length && !isPointsListVisible"
        class="info-card__item info-card__times"
      >
        <div v-if="isDept" class="info-card__item-title">Обслуживание ФЛ</div>
        <span v-for="(value, index) in item.workMode" :key="index">{{ value }}</span>
      </div>
      <template v-if="isTerminal || isAtm">
        <div
          v-if="Array.isArray(item.workMode) && !item.workMode.length"
          class="info-card__item info-card__item_fs_xs info-card__times"
        >
          {{ item.workingStatus.time }}
        </div>
        <div class="info-card__content" v-html="item.content"></div>
      </template>
      <div
        v-if="Array.isArray(item.workModeCom) && item.workModeCom.length && !isPointsListVisible"
        class="info-card__item info-card__times"
      >
        <div v-if="isDept" class="info-card__item-title">Обслуживание ЮЛ/ИП</div>
        <span v-for="(value, index) in item.workModeCom" :key="index">{{ value }}</span>
      </div>
    </div>
    <a
      :class="[
        'info-card__readmore',
        { 'info-card__readmore_mb_none': !isCardFooterVisible },
        { 'is-mobile-only': isCardFooterVisible },
      ]"
      v-if="!item.key"
      href="#"
      target="_blank"
    >
      <span>Подробнее</span>
      <ChevronRightIcon />
    </a>
    <a
      class="map-filter-btn map-filter-btn--mt-16 is-mobile-only"
      v-if="!isPointsListVisible && isCardFooterVisible && item.coords && item.coords.length"
      :href="`https://yandex.ru/maps/?rtext=~${item.coords[0].toString()},${item.coords[1].toString()}`"
      target="_blank"
    >
      маршрут от меня
    </a>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
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

/**
 * Карточка отображения данных отделения
 *
 * @component
 * @example
 * <InfoCard />
 */
export default defineComponent({
  name: "InfoCard",

  components: {
    CopyIcon,
    ExpendMoreIcon,
    ChevronRightIcon,
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
    index: {
      type: Number,
    },
  },

  setup(props) {
    const isDept = computed(() => props.currentCategory && props.currentCategory.type === FILIAL_KEY);
    const isAtm = computed(() => props.currentCategory && props.currentCategory.type === ATM_KEY);
    const isTerminal = computed(() => props.currentCategory && props.currentCategory.type === TERMINAL_KEY);
    const isPointsListVisible = computed(() => props.currentCategory && props.currentCategory.type === POINT_KEY);

    const categoryStore = useCategoryStore();

    /**
     * Копировать адрес отделения
     * @property {string} value - адрес отделения
    */
    const copyItemAddress = async (value: string) => {
      try {
        await navigator.clipboard.writeText(value);

        console.log({ value });
      } catch (error) {
        console.error(error);
      }
    };

    return {
      isDept,
      isAtm,
      isTerminal,
      isPointsListVisible,
      copyItemAddress,
      setSelectedItemsList: categoryStore.setSelectedItemsList
    }
  },
});
</script>
