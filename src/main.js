import { createApp } from 'vue'
import { piniaStore } from './store';

import './style.css'
import './styles/_import.scss'

import MapOfficeList from './map-office-list.vue'

const app = createApp(MapOfficeList);

app.use(piniaStore);
app.mount('#map-office-list')
