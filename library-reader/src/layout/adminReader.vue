<template>
    <div class="reader-layout">

        <!-- NAVBAR -->
        <nav class="navbar navbar-expand-lg navbar-dark nav-gradient shadow-sm">
            <div class="container">

                <!-- LOGO -->
                <router-link class="navbar-brand font-weight-bold" to="/">
                    Thư viện Sách
                </router-link>

                <!-- Toggle (mobile) -->
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navReader">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navReader">

                    <!-- SEARCH BAR -->
                    <form class="form-inline mx-auto w-50" @submit.prevent="submitSearch">
                        <input v-model="keyword" type="search" class="form-control w-100 nav-search"
                            placeholder="Tìm tên sách, nhà xuất bản, tác giả...">
                    </form>

                    <!-- RIGHT MENU -->
                    <ul class="navbar-nav ml-auto align-items-center">

                        <!-- Notifications -->
                        <li class="nav-item position-relative mx-2">
                            <button class="btn btn-link text-white p-0" @click="openNotification">
                                <i class="fa fa-bell fa-lg"></i>
                                <span v-if="notifyCount > 0" class="badge badge-danger notify-badge">{{ notifyCount
                                    }}</span>
                            </button>
                        </li>

                        <!-- ACCOUNT DROPDOWN -->
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button"
                                data-toggle="dropdown">
                                <i class="fa fa-user-circle mr-1"></i> {{ userName }}
                            </a>

                            <div class="dropdown-menu dropdown-menu-right shadow">
                                <!-- <router-link class="dropdown-item" to="/reader/profile">
                                    <i class="fa fa-user mr-2"></i> Thông tin tài khoản
                                </router-link> -->

                                <!-- <router-link class="dropdown-item" to="/reader/borrowed">
                                    <i class="fa fa-book mr-2"></i> Theo dõi mượn sách
                                </router-link> -->

                                <div class="dropdown-divider"></div>

                                <button class="dropdown-item text-danger" @click="logout">
                                    <i class="fa fa-sign-out mr-2"></i> Đăng xuất
                                </button>
                            </div>
                        </li>

                    </ul>
                </div>
            </div>
        </nav>

        <!-- Main -->
        <main class="container py-4">
            <router-view />
        </main>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const keyword = ref("");

const notifyCount = ref(3); // ví dụ, sau này lấy từ backend
const userName = "Độc giả"; // thay bằng dữ liệu login

const submitSearch = () => {
    if (!keyword.value.trim()) return;
    router.push({ path: "/search", query: { q: keyword.value } });
};

const logout = () => {
    alert("Đã đăng xuất"); // đặt API logout sau
    router.push("/login");
};

const openNotification = () => {
    alert("Mở danh sách thông báo!");
};
</script>

<style scoped>
.nav-gradient {
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
}

.nav-search {
    border-radius: 25px;
    padding-left: 16px;
}

.notify-badge {
    position: absolute;
    top: -2px;
    right: -6px;
    font-size: 11px;
    padding: 3px 6px;
    border-radius: 50%;
}
</style>
