import Vue from 'vue'
import VueRouter from 'vue-router'
import Main from '../views/Main.vue';
import Edit from '../views/Edit.vue';

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'The Task Planner',
    component: Main,
    props: true,
  },
  {
    path: '/edit/:taskId',
    name: 'Edit Task',
    component: Edit
  },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
