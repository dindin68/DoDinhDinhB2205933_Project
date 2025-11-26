import { createRouter, createWebHistory } from "vue-router";
import adminReader from "../layout/adminReader.vue";
import BookList from "../views/BookList.vue";
import BookDetail from "../views/BookDetail.vue";
import Register from "../views/Register.vue";
import Login from "../views/Login.vue";
import BorrowForm from "../views/BorrowForm.vue";
import MyBorrowings from "../views/MyBorrowings.vue";

const routes = [
  {
    path: "/",
    component: adminReader,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/books" },
      { path: "/books", component: BookList },
      { path: "/books/:id", component: BookDetail, props: true },
      { path: "/register", component: Register },
      { path: "/login", component: Login },
      { path: "/borrow/:bookId", component: BorrowForm, props: true },
      { path: "/my-borrowings", component: MyBorrowings },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
