import { createApp } from 'vue'
import './style.css'
import './styles/_import.scss'
import App from './App.vue'
import { piniaStore } from './store';

const app = createApp(App);

app.use(piniaStore);
app.mount('#app')
