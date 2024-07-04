import { MAP_ID } from './constants';

class YMapHandler {
  constructor() {
    this.mapId = MAP_ID;
    this.mapItem = null;
  }

  isMapItemExist() {
    return Boolean(this.mapItem);
  }

  destroyYMap() {
    if(this.isMapItemExist()) {
      this.mapItem.destroy();
      this.mapItem = null;
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        !this.isMapItemExist()
          ? resolve({
            isSucceed: true,
            message: 'Карта удалена'
          })
          : reject({
            isSucceed: false,
            message: 'Не удалось удалить карту'
          })
      }, 200);
    });
  }

  async loadYMap() {
    let data = { isSucceed: false };

    try {
      const yMaps = await new Promise((resolve) => ymaps.ready(resolve));

      data = { isSucceed: Boolean(yMaps), yMaps };
    } catch (error) {
      console.error(error);
    }

    return data;
  }

  async setMapItem({ coords, bounds }) {
    let data = { isSucceed: false };
    //console.log({ arr, coords, bounds });

    try {
      const res = await Promise.all([this.loadYMap(), this.destroyYMap()]);

      if(res.reduce((acc, { isSucceed }) => acc && isSucceed, true)) {
        console.log(res);
        const { yMaps } = res.reduce((acc, item) => {
          const key = Object.keys(item).find(key => key !== 'isSucceed');

          return { ...acc, [key]: item[key] };
        }, {});

        this.mapItem = new yMaps.Map(this.mapId, { coords, bounds, zoom: 11, controls: [] });
        data = { isSucceed: true, map: this.mapItem, yMaps };
      }
    } catch (error) {
      console.error(error);
    }

    return data;
  }

  async renderYMap(data) {
    const { arr, options, icons } = data;
    console.log(arr.map(({ key }) => key));

    const addEvent = (event) => {
      const { properties, options } = event.get('target');
      //console.log(options);
      //options.set('iconImageHref', './src/assets/map-icons/beeline-icon.png');
    };

    try {
      const { isSucceed, map, yMaps } = await this.setMapItem(data);

      if(isSucceed) {
        const collection = new yMaps.GeoObjectCollection(null, { preset: 'islands#blackDotIcon' });

        arr.forEach(({ id, coords, key }, index) => {
          //console.log({ id, coords });
          collection.add(new yMaps.Placemark(coords, { id, idx: index }, { ...options, ...(key && { ...icons[key] }) }));
        });

        map.geoObjects.events.add('hover', addEvent);
        map.geoObjects.add(collection);
      };
    } catch (error) {
      console.error(error);
    }
  }
}

const yMapHandler = new YMapHandler();

export default yMapHandler;
