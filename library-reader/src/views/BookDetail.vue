<template>
    <div class="position-absolute mt-3 ml-3">
        <button @click="$router.back()" class="btn btn-outline-light btn-sm shadow back-btn">
            ← Quay lại
        </button>
    </div>
    <div class="page d-flex justify-content-center align-items-center">
        <div v-if="loading" class="status-box">
            Đang tải...
        </div>
        <div v-else-if="book" class="detail-card">
            <h2 class="title">{{ book.TenSach || book.title }}</h2>

            <div class="content">
                <div v-if="book.ImageUrl" class="img-box">
                    <img :src="apiBase + book.ImageUrl" :alt="book.TenSach" />
                </div>

                <div class="info">
                    <p><span class="label">Mã sách:</span> {{ book.MaSach || book.code }}</p>
                    <p><span class="label">Tác giả:</span> <span class="author">{{ book.TacGia || book.author }}</span>
                    </p>
                    <p>
                        <span class="label">Nhà xuất bản:</span>
                        <span class="author">
                            {{ book.TENNXB || book.NhaXuatBan?.TENNXB || 'Đang cập nhật' }}
                        </span>
                    </p>

                    <router-link :to="`/borrow/${book.MaSach || book._id}`" class="borrow-btn" @click.stop>
                        Đăng ký mượn
                    </router-link>

                </div>
            </div>
        </div>

        <div v-else class="status-box">
            Không tìm thấy sách
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import { useRoute } from 'vue-router'

const route = useRoute()
const book = ref(null)
const loading = ref(true)
const apiBase = "http://localhost:3000"

const load = async () => {
    loading.value = true
    try {
        const id = route.params.id   // lấy ID từ URL
        const res = await api.get(`/books/${id}`)
        book.value = res.data
    } catch (err) {
        console.error(err)
        alert("Lỗi khi tải thông tin sách!")
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>


<style scoped>
/* === VARIABLES === */
:root {
    --gradient: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
    --primary: #6d28d9;
    --white: #fff;
    --text: #1f2937;
}

.page {
    border-radius: 10px;
    padding: 2%;
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
}

/* === PAGE LAYOUT === */
.page-wrapper {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    min-height: 90vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--white);
}

/* === DETAIL CARD === */
.detail-card {
    width: 100%;
    max-width: 800px;
    background: var(--white);
    padding: 30px;
    border-radius: 18px;
    box-shadow: 0 12px 28px rgba(99, 102, 241, 0.12);
    animation: fadeIn 0.5s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* === TITLE === */
.title {
    font-size: 2.2rem;
    margin-bottom: 25px;
    font-weight: 900;
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;

    /* làm chữ nét hơn */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    /* giữ shadow nhưng giảm opacity */
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);

    text-align: center;
}

/* === CONTENT === */
.content {
    display: flex;
    gap: 35px;
    flex-wrap: wrap;
    justify-content: center;
    /* căn giữa ngang */
    align-items: center;
    /* căn giữa dọc */
    width: auto;
    /* cho content co theo nội dung */
}

/* === IMAGE BOX === */
.img-box {
    width: 220px;
    border-radius: 15px;
    overflow: hidden;
    border: 3px solid #8b5cf6;
    box-shadow: 0 8px 18px rgba(139, 92, 246, 0.25);
    background: white;
    flex-shrink: 0;
}

.img-box img {
    width: 100%;
    display: block;
}

/* === INFO === */
.info {
    font-size: 1.1rem;
    color: var(--text);
    min-width: 250px;
    max-width: 400px;
}

.info p {
    margin-bottom: 12px;
}

.label {
    font-weight: 700;
    color: var(--primary);
}

.author {
    font-style: italic;
    color: #7c3aed;
}

/* === BUTTONS === */

.borrow-btn {
    display: inline-block;
    margin-top: 20px;
    padding: 12px 28px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
    color: white !important;
    font-weight: 600;
    border: 2px solid #8b5cf6;
    border-radius: 12px;
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
    text-decoration: none;
}

.borrow-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(139, 92, 246, 0.35);
}

.back-btn {
    background: white;
    border-radius: 40px;
    border: 2px solid #8b5cf6;
    color: #6d28d9;
    margin-bottom: 20px;
}

.back-btn:hover {
    border-color: transparent;
    transform: translateY(-2px);
}

/* === STATUS BOX === */
.status-box {
    text-align: center;
    padding: 40px;
    font-size: 1.4rem;
    color: var(--primary);
    border: 2px dashed #8b5cf6;
    border-radius: 12px;
    margin-top: 25px;
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
    .content {
        flex-direction: column;
        gap: 20px;
        text-align: center;
        align-items: center;
    }

    .img-box {
        width: 180px;
    }

    .borrow-btn {
        width: 100%;
        max-width: 250px;
    }

    .title {
        font-size: 1.8rem;
    }
}

@media (max-width: 480px) {
    .detail-card {
        padding: 20px;
    }

    .title {
        font-size: 1.6rem;
    }

    .img-box {
        width: 150px;
    }

    .back-btn {
        padding: 6px 14px;
        font-size: 13px;
    }

    .status-box {
        padding: 30px;
        font-size: 1.2rem;
    }
}

/* === ANIMATION === */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
