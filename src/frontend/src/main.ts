import { createApp } from 'vue';
import AppSetup from './AppSetup.vue';
import createAppRouter from './routes/index';
import { routes } from './routes/routes';
import { pinia } from './stores/index';
import './style.css';

const app = createApp(AppSetup);
const router = createAppRouter(routes);

app.use(router);
app.use(pinia);

app.mount('#app');
