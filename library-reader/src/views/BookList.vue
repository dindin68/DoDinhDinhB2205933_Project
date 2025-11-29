<template>
    <div class="home-page">
        <div class="container mt-4">

            <!-- Loading -->
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary"></div>
                <p class="mt-2">Đang tải sách...</p>
            </div>

            <!-- LIST SÁCH -->
            <div v-else class="row">

                <div v-for="b in books" :key="b.MaSach || b._id" class="col-md-3 mb-4">
                    <!-- CARD -->
                    <div class="card book-card shadow-lg border-0 h-100" @click="goDetail(b)">

                        <!-- Ảnh sách -->
                        <img :src="apiBase + b.ImageUrl" alt="Ảnh sách" class="book-img mx-auto d-block" />

                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title text-primary font-weight-bold">
                                {{ b.TenSach }}
                            </h5>

                            <p class="text-muted mb-2">
                                Mã sách: <strong>{{ b.MaSach }}</strong>
                            </p>

                            <p class="text-muted mb-2">
                                Tác giả: <strong>{{ b.TacGia }}</strong>
                            </p>

                            <!-- NÚT ĐĂNG KÝ MƯỢN -->
                            <router-link :to="`/borrow/${b.MaSach || b._id}`" class="btn btn-gradient mt-auto"
                                @click.stop>
                                Đăng ký mượn
                            </router-link>
                        </div>

                    </div>
                </div>

            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../api";

const books = ref([]);
const router = useRouter()
const loading = ref(true);
const apiBase = "http://localhost:3000"; // BASE URL backend
const goDetail = (b) => {
    router.push(`/books/${b.MaSach || b._id}`);
};

const load = async () => {
    loading.value = true;
    try {
        const res = await api.get("/books");
        books.value = res.data || [];
    } catch (err) {
        console.error(err);
        alert("Lỗi khi tải danh sách sách!");
    } finally {
        loading.value = false;
    }
};

onMounted(load);
</script>

<style scoped>
.hero-header {
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
}

.book-card {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    border-radius: 12px;
}

.book-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.book-img {
    height: 220px;
    object-fit: cover;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
}

.btn-gradient {
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
    color: white;
    border-radius: 25px;
    padding: 8px 16px;
    text-align: center;
    transition: 0.3s;
}

.btn-gradient:hover {
    opacity: 0.85;
    color: #fff;
}
</style>
