import { createRouter, createWebHistory } from 'vue-router';
import AssetsView from '@/views/AssetsView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'assets',
      component: AssetsView,
    },
  ],
});
