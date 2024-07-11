import { createApp } from 'vue'
import { piniaStore } from './store';

import './style.css'
import './styles/_import.scss'

import OfficeListMap from './office-list-map.vue'

const app = createApp(OfficeListMap);

app.use(piniaStore);
app.mount('#map-office-list')
