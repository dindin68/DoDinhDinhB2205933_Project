import { createRouter, createWebHistory } from "vue-router";
import AdminLayout from "../layouts/adminLayout.vue";
import BookList from "../views/books/bookList.vue";
import BookForm from "../views/books/bookForm.vue";
import BorrowingList from "../views/borrowings/BorrowingList.vue";
import BorrowingForm from "../views/borrowings/BorrowingForm.vue";
import ReaderList from "../views/readers/ReaderList.vue";
import ReaderForm from "../views/readers/ReaderForm.vue";
import PublisherList from "../views/publishers/PublisherList.vue";
import PublisherForm from "../views/publishers/PublisherForm.vue";
import AdminLogin from "../views/auth/AdminLogin.vue";

const routes = [
  {
    path: "/",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/books" },
      { path: "books", component: BookList },
      { path: "borrowings", component: BorrowingList },
      { path: "readers", component: ReaderList },
      { path: "publishers", component: PublisherList },
      { path: "/books/create", component: BookForm },
      { path: "/books/edit/:id", component: BookForm, props: true },
      { path: "/readers/create", component: ReaderForm },
      { path: "/readers/edit/:id", component: ReaderForm, props: true },
      { path: "/borrowings/create", component: BorrowingForm },
      { path: "/borrowings/edit/:id", component: BorrowingForm, props: true },
      { path: "/publishers/create", component: PublisherForm },
      { path: "/publishers/edit/:id", component: PublisherForm, props: true },
    ],
  },
  { path: "/admin/login", component: AdminLogin },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global guard: redirect to login if route requires auth and user not logged in
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(
    (record) => record.meta && record.meta.requiresAuth
  );
  const token = localStorage.getItem("admin_token");
  if (requiresAuth && !token) {
    return next({ path: "/admin/login", query: { redirect: to.fullPath } });
  }
  next();
});

export default router;
