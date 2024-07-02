<template>
  <div class="info-card">
    <div class="info-card__header">
      <div class="info-card__category" v-if="currentCategory">{{ currentCategory.category }}</div>
      <div class="info-card__caption">{{ item.name }}</div>
    </div>
    <div
      :class="['info-card__wrapper', { 'info-card__wrapper_mb_none': isPointsListVisible }]"
    >
      <div
        :class="[
          'info-card__item info-card__item_fw_bold',
          { 'info-card__item_color_primary': item.workingStatus && item.workingStatus.isWork },
          { 'info-card__item_color_danger': item.workingStatus && !item.workingStatus.isWork }
        ]"
        v-if="item.workingStatus"
      >
        <template v-if="item.workingStatus.isWork">Открыто</template>
        <template v-else>Закрыто</template>

        <template v-if="item.workingStatus.time"> до {{ item.workingStatus.time }}</template>
      </div>
      <div class="info-card__item info-card__item_fw_bold info-card__item_type_row">
        {{ item.address }}
        <button class="info-card__item-toggler" type="button"><CopyIcon /></button>
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
    <a class="info-card__readmore" :href="`/retail/branches/detail.php?ID=${item.id}`" v-if="!isPointsListVisible">Подробнее</a>
    <div class="info-card__footer" v-if="isCardFooterVisible">
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
  import CopyIcon from './assets/icons/copy-icon.vue';

  export default {
    name: 'info-card',

    components: {
      CopyIcon
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
  };
</script>
