<template>
    <div class="reader-layout d-flex flex-column min-vh-100">

        <nav class="navbar navbar-expand-lg navbar-dark nav-gradient shadow fixed-top">
            <div class="container">

                <router-link class="navbar-brand fw-bold d-flex align-items-center" to="/">
                    <i class="fas fa-book-open me-2" style="font-size: 1.5rem;"></i>
                    <span class="d-none d-sm-inline">Thư viện Sách</span>
                </router-link>

                <button class="navbar-toggler border-0" type="button" @click="isMenuOpen = !isMenuOpen">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" :class="{ 'show': isMenuOpen }">

                    <form class="search-box mx-auto my-2 my-lg-0" @submit.prevent="submitSearch">
                        <div class="search-wrapper">
                            <input v-model="keyword" type="search" class="search-input"
                                placeholder="Tìm sách, tác giả..." />

                            <button type="submit" class="search-btn">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </form>


                    <ul class="navbar-nav ms-auto align-items-center gap-3">

                        <li class="nav-item d-lg-none">
                            <router-link class="nav-link text-white" to="/">Trang chủ</router-link>
                        </li>

                        <li class="nav-item dropdown position-relative" ref="dropdownRef">
                            <a class="nav-link dropdown-toggle text-white d-flex align-items-center cursor-pointer"
                                @click.prevent="toggleDropdown">
                                <div class="avatar-circle me-2">
                                    <i class="fas fa-user"></i>
                                </div>
                                <span class="fw-bold mx-1">{{ userName }}</span>
                            </a>

                            <div class="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 mt-2 p-2"
                                :class="{ 'show': isDropdownOpen }" style="min-width: 220px; right: 0; left: auto;">

                                <div class="px-3 py-2 border-bottom mb-2">
                                    <small class="text-muted d-block">Xin chào, <strong class="text-primary">{{ userName
                                            }}</strong></small>

                                </div>

                                <router-link class="dropdown-item rounded-3 mb-1" to="/profile" @click="closeDropdown">
                                    <i class="fas fa-id-card me-2 text-info"></i> Thông tin tài khoản
                                </router-link>

                                <router-link class="dropdown-item rounded-3 mb-1" to="/my-borrowings"
                                    @click="closeDropdown">
                                    <i class="fas fa-book-reader me-2 text-warning"></i> Lịch sử mượn sách
                                </router-link>

                                <div class="dropdown-divider my-2"></div>
                                <button class="dropdown-item rounded-3 text-danger fw-bold" @click="logout">
                                    <i class="fas fa-sign-out-alt me-2"></i> Đăng xuất
                                </button>
                            </div>
                        </li>

                    </ul>
                </div>
            </div>
        </nav>

        <main class="flex-grow-1 container" style="margin-top: 80px; padding-bottom: 40px;">
            <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </main>

        <footer class="bg-light text-center py-4 mt-auto border-top">
            <div class="container">
                <p class="mb-0 text-muted">
                    &copy; {{ new Date().getFullYear() }} <strong>Thư viện Sách Online</strong>.
                    <span class="d-block d-md-inline">Tri thức là sức mạnh.</span>
                </p>
            </div>
        </footer>

    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const keyword = ref("");
const isMenuOpen = ref(false); // Quản lý toggle mobile
const isDropdownOpen = ref(false); // Quản lý dropdown user
const dropdownRef = ref(null); // Ref để bắt sự kiện click outside

// Lấy user
const userData = localStorage.getItem('readerUser')
    ? JSON.parse(localStorage.getItem('readerUser'))
    : null;

const userName = userData ? (userData.TEN || userData.HoLot + ' ' + userData.TEN) : 'Độc giả';

// Toggle Dropdown
const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value;
}

const closeDropdown = () => {
    isDropdownOpen.value = false;
    isMenuOpen.value = false; // Đóng luôn menu mobile nếu đang mở
}

// Xử lý Click ra ngoài để đóng dropdown
const handleClickOutside = (event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isDropdownOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

// Search
const submitSearch = () => {
    if (!keyword.value.trim()) return;

    // Đóng menu mobile sau khi search
    isMenuOpen.value = false;

    router.push({
        path: "/",
        query: { q: keyword.value }
    });
};

// Logout
const logout = () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem('reader_token');
        localStorage.removeItem('readerUser');
        router.push('/login');
    }
};
</script>

<style scoped>
.nav-gradient {
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
}

.avatar-circle {
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.5);
}

.dropdown-menu {
    display: block;
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);
    transition: all 0.2s ease;
}

.dropdown-menu.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.dropdown-item {
    transition: all 0.2s;
    font-size: 0.95rem;
    padding: 10px 15px;
}

.dropdown-item:hover {
    background-color: #f3f4f6;
    transform: translateX(5px);
}

.cursor-pointer {
    cursor: pointer;
}

/* Route Transition */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* === SEARCH BOX BEAUTY === */
.search-box {
    width: 100%;
    max-width: 520px;
}

.search-wrapper {
    position: relative;
    width: 100%;
    background: #fff;
    border-radius: 999px;
    padding: 6px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
}

.search-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 10px 18px;
    font-size: 0.95rem;
    border-radius: 999px;
    background: transparent;
}

.search-btn {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s ease;
}

.search-btn:hover {
    transform: scale(1.08);
    opacity: 0.9;
}

/* Mobile */
@media (max-width: 768px) {
    .search-box {
        max-width: 100%;
    }
}

/* Mobile responsive tweak */
@media (max-width: 991px) {
    .navbar-collapse {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        padding: 1rem;
        border-radius: 1rem;
        margin-top: 10px;
    }

    .form-inline {
        margin-bottom: 1rem;
    }
}
</style>