<template>
  <div class="info-card">
    <div class="info-card__header">
      <div class="info-card__category" v-if="currentCategory">{{ currentCategory.category }}</div>
      <div class="info-card__caption">{{ item.name }}</div>
    </div>
    <div
      :class="[
        'info-card__wrapper',
        { 'info-card__wrapper_margin_bottom': !isPointsListVisible },
        { 'info-card__wrapper_mb_none': !isCardFooterVisible }
      ]"
    >
      <div
        :class="[
          'info-card__item info-card__item_fw_bold',
          { 'info-card__item_color_primary': item.workingStatus && item.workingStatus.isWork },
          { 'info-card__item_color_danger': item.workingStatus && !item.workingStatus.isWork }
        ]"
        v-if="item.workingStatus"
      >
        <template v-if="isPointsListVisible">
          <template v-if="item.workingStatus.isWork">Открыто</template>
          <template v-else>Закрыто</template>
          до
        </template>

        <template v-if="item.workingStatus.time">{{ item.workingStatus.time }}</template>
      </div>
      <div class="info-card__item info-card__item_fw_bold info-card__item_type_row">
        {{ item.address }}
        <button class="info-card__item-toggler" type="button" @click="copyItemAddress(item.address)"><CopyIcon /></button>
      </div>
      <div
        v-if="Array.isArray(item.workMode) && item.workMode.length"
        class="info-card__item"
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
      class="info-card__toggler"
      type="button"
        v-if="!isCardFooterVisible"
       @click="setCurrentItem({ ...item, ...(!item.coords && { coords: [Number(item.lon), Number(item.lat)] }) })"
    >
    </button>
    <a class="info-card__readmore" :href="`/retail/branches/detail.php?ID=${item.id}`" v-if="!isPointsListVisible">Подробнее</a>
    <div class="info-card__footer" v-if="isCardFooterVisible">
      <a
        class="map-filter-btn"
        v-if="item.coords && item.coords.length"
        :href="`https://yandex.ru/maps/?rtext=~${item.coords[0].toString()},${item.coords[1].toString()}`"
        target="_blank"
      >
        маршрут от меня
      </a>
      <div class="info-card__section">
        <div class="info-card__item info-card__item_type_title">О филиале</div>
        <div class="info-card__content" v-if="(Array.isArray(item.phone) && item.phone.length) || item.email">
          <div class="info-card__item info-card__item_type_subtitle">Контактная информация:</div>
          <div class="info-card__item info-card__item_fs_sm">
            <template v-if="Array.isArray(item.phone) && item.phone.length">
              <template
                v-for="(value, index) in item.phone"
                :key="index"
              >
                {{ value }}<br />
              </template>
            </template>
            <template v-if="item.email">{{ item.email }}</template>
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
  </div>
</template>

<script>
  import { mapActions } from 'pinia';
  import { useCategoryStore } from '../store/modules/category';
  import CopyIcon from '../assets/icons/copy-icon.vue';

  export default {
    name: 'info-card',

    components: {
      CopyIcon
    },

    data() {
      return {
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
      isPointsListVisible: {
        type: Boolean
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
      }
    },

    methods: {
      ...mapActions(useCategoryStore, ['setCurrentItem']),

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
