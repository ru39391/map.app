<template>
  <div class="info-card">
    <div class="info-card__header">
      <div class="info-card__category" v-if="currentCategory">{{ isDept ? item.subname : currentCategory.category }}</div>
      <div class="info-card__caption">
        <template v-if="isAtm">ОТП Банк</template><template v-else>{{ item.name }}</template>
        <!--
        <template v-if="isDept && item.subname"> ({{ item.subname.toLowerCase() }})</template>
        -->
      </div>
    </div>
    <div
      :class="[
        'info-card__wrapper',
        { 'info-card__wrapper_margin_bottom': !isPointsListVisible },
        { 'info-card__wrapper_mb_none': !isCardFooterVisible || isPointsListVisible }
      ]"
    >
      <div
        :class="[
          'info-card__item info-card__item_fw_bold',
          { 'info-card__item_color_primary': item.workingStatus && item.workingStatus.isWork },
          { 'info-card__item_color_danger': item.workingStatus && !item.workingStatus.isWork }
        ]"
        v-if="item.workingStatus && !isTerminal && !isPointsListVisible"
      >
        <template v-if="isPointsListVisible">
          <template v-if="item.workingStatus.isWork">Открыто</template>
          <template v-else>Закрыто</template>

          <template v-if="item.workingStatus.time"> до </template>
        </template>

        <template v-if="item.workingStatus.time">{{ item.workingStatus.time }}</template>
      </div>
      <div class="info-card__item info-card__item_fw_bold info-card__item_type_row">
        {{ item.address }}
        <button class="info-card__item-toggler" type="button" @click="copyItemAddress(item.address)"><CopyIcon /></button>
      </div>
      <div
        v-if="Array.isArray(item.workMode) && item.workMode.length && !isPointsListVisible"
        class="info-card__item info-card__item_fs_sm"
      >
        <template
          v-for="(value, index) in item.workMode"
          :key="index"
        >
          {{ value }}<br />
        </template>
      </div>
    </div>
    <button
      v-if="!isCardFooterVisible"
      class="info-card__toggler"
      type="button"
      @click="setSelectedItemsList([item.id])"
    >
    </button>
    <a class="info-card__readmore" :href="`/retail/branches/detail.php?ID=${item.id}`" v-if="!isPointsListVisible">Подробнее</a>
    <button
      v-if="isDept && isCardFooterVisible && !isPointsListVisible"
      :class="[
        'info-card__link info-card__link_type_btn',
        { 'is-active': !isCardFooterHidden }
      ]"
      type="button"
      @click="setCardFooterHidden"
    >
      <template v-if="isCardFooterHidden">Показать</template><template v-else>Скрыть</template>
      <ExpendMoreIcon class="info-card__link-arrow" />
    </button>
    <div :class="['info-card__footer', { 'is-hidden': isCardFooterHidden }]" v-if="isCardFooterVisible && !isPointsListVisible">
      <div class="info-card__section">
        <div class="info-card__item info-card__item_type_title" v-if="isDept">
          <template v-if="item.subname === 'Дополнительный офис'">О дополнительном офисе</template>
          <template v-else>О филиале</template>
        </div>
        <div class="info-card__content" v-if="(Array.isArray(item.phone) && item.phone.length) || item.email">
          <div class="info-card__item info-card__item_type_subtitle">Контактная информация:</div>
          <div class="info-card__item info-card__item_fs_sm">
            <template v-if="Array.isArray(item.phone) && item.phone.length">
              <template
                v-for="(value, index) in item.phone"
                :key="index"
              >
                <a class="info-card__link" :href="`tel:${value.replace(/\s+/g, '')}`">{{ value }}</a><br />
              </template>
            </template>
            <a class="info-card__link" :href="`mailto:${item.email}`" v-if="item.email">{{ item.email }}</a>
          </div>
        </div>
        <template v-if="false">
          <div class="info-card__content">
            <div class="info-card__item info-card__item_type_subtitle">Полное наименование:</div>
          </div>
          <div class="info-card__content">
            <div class="info-card__item info-card__item_type_subtitle">Сокращенное наименование:</div>
          </div>
          <div class="info-card__content">
            <div class="info-card__item info-card__item_type_subtitle">Реквизиты:</div>
          </div>
        </template>
        <div class="info-card__content" v-if="item.director">
          <div class="info-card__item info-card__item_type_subtitle">Директор филиала:</div>
          <div class="info-card__item info-card__item_fs_sm">{{ item.director }}</div>
        </div>
      </div>
      <div class="info-card__section" v-if="isServicesListExist">
        <div class="info-card__item info-card__item_type_title">Услуги</div>
        <template v-if="Array.isArray(item.fl) && item.fl.length">
          <div class="info-card__content">
            <div class="info-card__item info-card__item_type_subtitle">Обслуживание физических лиц</div>
            <div class="info-card__item info-card__item_fs_sm">
              <template
                v-for="(value, index) in item.fl"
                :key="index"
              >
                {{ value }}<br />
              </template>
            </div>
          </div>
        </template>
        <template
          v-for="(param, index) in servicesList"
          :key="index"
        >
          <div class="info-card__content" v-if="param.value">
            <div class="info-card__item info-card__item_type_subtitle">{{ param.caption }}</div>
          </div>
        </template>
      </div>
    </div>
    <a
      class="map-filter-btn"
      v-if="isCardFooterVisible && isDept && item.coords && item.coords.length"
      :href="`https://yandex.ru/maps/?rtext=~${item.coords[0].toString()},${item.coords[1].toString()}`"
      target="_blank"
    >
      маршрут от меня
    </a>
  </div>
</template>

<script>
  import { mapActions } from 'pinia';
  import { useCategoryStore } from '../store/modules/category';
  import { FILIAL_KEY, ATM_KEY, POINT_KEY, TERMINAL_KEY } from '../utils/constants';
  import CopyIcon from '../assets/icons/copy-icon.vue';
  import ExpendMoreIcon from '../assets/icons/expend-more-icon.vue';

  export default {
    name: 'info-card',

    components: {
      CopyIcon,
      ExpendMoreIcon
    },

    data() {
      return {
        isCardFooterHidden: true,
        servicesDataList: [
          {key: 'sb', caption: 'Обслуживание малого и среднего бизнеса'},
          {key: 'crp', caption: 'Обслуживание корпоративных клиентов'},
          {key: 'mobile_group', caption: 'Отделение оборудовано средствами для доступа маломобильных групп населения'}
        ]
      }
    },

    props: {
      item: {
        type: Object,
        required: true
      },
      currentCategory: {
        type: Object
      },
      isCardFooterVisible: {
        type: Boolean
      }
    },

    computed: {
      servicesList() {
        return this.item && this.servicesDataList.map(({ key, caption }) => ({ value: this.item[key], caption }));
      },

      isServicesListExist() {
        return this.item && Array.isArray(this.item.fl) && this.item.fl.length || this.servicesDataList.reduce((acc, { key }) => acc || Boolean(this.item[key]), false);
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
      }
    },

    methods: {
      ...mapActions(useCategoryStore, ['setSelectedItemsList']),

      setCardFooterHidden() {
        this.isCardFooterHidden = !this.isCardFooterHidden;
      },

      async copyItemAddress(value) {
        try {
          await navigator.clipboard.writeText(value);

          console.log({value});
        } catch (error) {
          console.error(error);
        }
      }
    }
  };
</script>
