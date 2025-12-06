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
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "../api";

const books = ref([]);
const loading = ref(true);

const router = useRouter();
const route = useRoute();

const apiBase = "http://localhost:3000"; // BASE URL backend

const goDetail = (b) => {
    router.push(`/books/${b.MaSach || b._id}`);
};

// FETCH BOOK CÓ SEARCH
const load = async () => {
    loading.value = true;
    try {
        const res = await api.get("/books", {
            params: {
                q: route.query.q || ""   //LẤY KEYWORD TỪ URL
            }
        });

        books.value = res.data || [];
    } catch (err) {
        console.error(err);
        alert("Lỗi khi tải danh sách sách!");
    } finally {
        loading.value = false;
    }
};

onMounted(load);

watch(() => route.query.q, load);
</script>


<style scoped>
.home-page {
    /* Đảm bảo nội dung không bị dính vào rìa */
    padding-left: 15px;
    padding-right: 15px;
}

.book-card {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    border-radius: 12px;
    cursor: pointer;
    /* Thêm con trỏ để gợi ý click */
}

.book-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.book-img {
    height: 220px;
    width: 100%;
    /* Đảm bảo ảnh sử dụng toàn bộ chiều rộng của card */
    max-width: 180px;
    /* Giới hạn chiều rộng ảnh */
    object-fit: contain;
    /* Giữ tỷ lệ, fit trong khung 220px */
    padding: 15px 15px 0 15px;
    /* Thêm padding để ảnh không bị dính vào cạnh */
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    margin-bottom: 10px;
}

.card-title {
    /* Sử dụng gradient cho màu tiêu đề */
    background-image: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
    font-size: 1.25rem;
    line-height: 1.4;
    min-height: 3.5rem;
    /* Giữ chiều cao cố định cho tiêu đề 2 dòng */
}

/* Nút Gradient */
.btn-gradient {
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
    color: white;
    border-radius: 25px;
    padding: 8px 16px;
    text-align: center;
    transition: 0.3s;
    font-weight: 600;
}

.btn-gradient:hover {
    opacity: 0.85;
    color: #fff;
    /* Loại bỏ màu border mặc định của Bootstrap khi hover */
    border-color: transparent;
}


/* ==================================== */
/* RESPONSIVE DESIGN (Media Queries) */
/* ==================================== */

/* Tablet nhỏ & Mobile ngang (576px đến 767px) */
@media (min-width: 576px) and (max-width: 767px) {

    /* Thay đổi bố cục cột Bootstrap: 2 cột trên màn hình nhỏ/tablet */
    .col-md-3 {
        flex: 0 0 50%;
        max-width: 50%;
    }

    .book-img {
        max-width: 160px;
        height: 180px;
    }

    .card-title {
        font-size: 1.1rem;
        min-height: 3.3rem;
    }
}

/* Mobile dọc (dưới 576px) */
@media (max-width: 575px) {

    /* Thay đổi bố cục cột Bootstrap: 1 cột duy nhất */
    .col-md-3 {
        flex: 0 0 100%;
        max-width: 100%;
    }

    /* Thiết lập lại card cho mobile: Ảnh lớn hơn, thông tin rõ ràng */
    .book-card {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 10px;
    }

    .book-img {
        width: 100px;
        /* Ảnh nhỏ gọn hơn khi nằm ngang */
        height: 130px;
        object-fit: cover;
        flex-shrink: 0;
        margin: 0;
        padding: 0;
        margin-right: 15px;
        border-radius: 8px;
    }

    .card-body {
        padding: 5px 0 5px 5px;
    }

    .card-title {
        font-size: 1.2rem;
        margin-bottom: 5px;
        min-height: auto;
        /* Không cần chiều cao cố định khi bố cục ngang */
    }

    .text-muted {
        font-size: 0.9rem;
        margin-bottom: 3px !important;
    }

    .btn-gradient {
        font-size: 0.9rem;
        padding: 5px 12px;
    }
}
</style>