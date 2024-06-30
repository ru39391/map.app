<template>
  <div
    v-for="item in currentItemsList"
    :key="item.id"
    :ref="`card-${item.id}`"
    :id="`card-${item.id}`"
    class="info-card"
  >
    <div class="info-card__header">
      <div class="info-card__category" v-if="currentCategory">{{ currentCategory.category }}</div>
      <div class="info-card__caption">{{ item.name }}</div>
    </div>
    <div class="info-card__wrapper">
      <div class="info-card__item info-card__item_fw_bold info-card__item_color_primary" v-if="false">Открыто до 20:00</div>
      <div class="info-card__item info-card__item_fw_bold info-card__item_type_row">
        {{ item.address }}
        <button class="info-card__item-toggler" type="button"><CopyIcon /></button>
      </div>
      <div
        v-if="Array.isArray(item.work_mode) && item.work_mode.length"
        class="info-card__item"
      >
        <template
          v-for="(value, index) in item.work_mode"
          :key="index"
        >
          {{ value }}<br />
        </template>
      </div>
    </div>
    <a class="info-card__readmore" href="#">Подробнее</a>
    <div class="info-card__footer">
      <a class="map-filter-btn" href="#">маршрут от меня</a>
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
      <div class="info-card__section">
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
          v-for="(param, index) in [
            {value: item.sb, caption: 'Обслуживание малого и среднего бизнеса'},
            {value: item.crp, caption: 'Обслуживание корпоративных клиентов'},
            {value: item.mobile_group, caption: 'Отделение оборудовано средствами для доступа маломобильных групп населения'}
          ]"
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
  import { mapActions, mapState } from 'pinia';
  import { useCategoryStore } from './store/modules/category';
  import CopyIcon from './assets/icons/copy-icon.vue';

  export default {
    name: 'info-card-list',

    components: {
      CopyIcon
    },

    computed: {
      ...mapState(
        useCategoryStore,
        ['currentItemsList', 'currentRefsList', 'currentCategory']
      ),
    },

    methods: {
      ...mapActions(useCategoryStore, ['setCurrentRefsList'])
    },

    watch: {
      currentRefsList(arr) {
        //console.log({ refs: arr });
      },
    },

    mounted() {
      //this.setCurrentRefsList(this.currentItemsList.map(({ id }) => ({ id, target: this.$refs[`card-${id}`]})));
    }
  };
</script>
