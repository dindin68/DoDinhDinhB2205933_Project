<template>
    <div class="container-fluid px-0" style="background: linear-gradient(135deg, #f8fafc, #f1f5f9);">
        <!-- Header -->
        <nav class="navbar navbar-expand-lg"
            style="background: linear-gradient(90deg, #4f46e5, #8b5cf6); box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.3);">
            <div class="container d-flex justify-content-between align-items-center py-4">
                <h1 class="text-white font-weight-bold display-4">Quản Lý Thư Viện</h1>
                <nav class="d-flex align-items-center">
                    <router-link to="/books" class="nav-link text-white mx-2 hover-scale">Sách</router-link>
                    <router-link to="/readers" class="nav-link text-white mx-2 hover-scale">Độc giả</router-link>
                    <router-link to="/borrowings" class="nav-link text-white mx-2 hover-scale">Mượn sách</router-link>
                    <router-link to="/publishers" class="nav-link text-white mx-2 hover-scale">NXB</router-link>
                    <div class="ml-3">
                        <button v-if="!isLogged" @click="goLogin" class="btn btn-outline-light">Đăng nhập</button>
                        <div v-else class="d-flex align-items-center">
                            <span class="text-white mr-3">Xin chào</span>
                            <button @click="logout" class="btn btn-outline-light">Đăng xuất</button>
                        </div>
                    </div>
                </nav>
            </div>
        </nav>

        <!-- Main -->
        <main class="container-fluid mx-auto py-2 d-flex justify-content-center ">
            <router-view />
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLogged = ref(false)

onMounted(() => {
    isLogged.value = !!(localStorage.getItem('adminUser') || localStorage.getItem('token'))
})

const goLogin = () => router.push('/admin/login')
const logout = () => { localStorage.removeItem('adminUser'); localStorage.removeItem('token'); isLogged.value = false; router.push('/admin/login') }
</script>

<style>
.hover-scale {
    transition: transform 0.2s, color 0.2s;
}

.hover-scale:hover {
    transform: scale(1.1);
    color: #facc15 !important;
    /* vàng sáng tương tự Tailwind hover:text-yellow-300 */
}
</style>
