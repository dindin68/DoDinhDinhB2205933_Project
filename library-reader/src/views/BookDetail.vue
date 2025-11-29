<template>
    <div class="page-wrapper">
        <button @click="$router.back()" class="back-btn">← Quay lại</button>

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

                    <router-link :to="`/borrow/${book._id}`" class="borrow-btn">
                        Đăng kí mượn
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
import api from '../api' // Đảm bảo đường dẫn này đúng
import { useRoute } from 'vue-router'

const route = useRoute()
const book = ref(null)
const loading = ref(false)
const apiBase = "http://localhost:3000"; // BASE URL backend


const load = async () => {
    loading.value = true
    try {
        const res = await api.get(`/books/${route.params.id}`)
        book.value = res.data
    } catch (e) {
        console.error("Lỗi khi tải chi tiết sách:", e)
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>

<style scoped>
.page-wrapper {
    max-width: 900px;
    margin: 20px auto;
    padding: 20px;
    min-height: 90vh;
    background: var(--bg);
}

/* === BUTTONS === */
.back-btn,
.borrow-btn {
    padding: 8px 16px;
    border-radius: 40px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: 0.25s;
    text-decoration: none;
}

.back-btn {
    background: none;
    border: 2px solid #8b5cf6;
    color: #6d28d9;
}

.back-btn:hover {
    background: var(--gradient);
    color: #fff;
    border-color: transparent;
    transform: translateY(-2px);
}

.borrow-btn {
    display: inline-block;
    margin-top: 20px;
    padding: 12px 28px;
    background: var(--gradient);
    color: white;
    border-radius: 12px;
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
}

.borrow-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(139, 92, 246, 0.35);
}

/* CARD */
.detail-card {
    background: var(--white);
    padding: 30px;
    border-radius: 18px;
    margin-top: 20px;
    box-shadow: 0 12px 28px rgba(99, 102, 241, 0.12);
    animation: fadeIn 0.5s ease;
}

.title {
    font-size: 2.1rem;
    margin-bottom: 25px;
    font-weight: 800;
    background: var(--gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* CONTENT */
.content {
    display: flex;
    gap: 35px;
    flex-wrap: wrap;
    align-items: flex-start;
}

.img-box {
    width: 220px;
    border-radius: 15px;
    overflow: hidden;
    border: 3px solid #8b5cf6;
    box-shadow: 0 8px 18px rgba(139, 92, 246, 0.25);
    flex-shrink: 0;
    background: white;
}

.img-box img {
    width: 100%;
}

.info {
    flex: 1;
    font-size: 1.1rem;
    color: var(--text);
    min-width: 250px;
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

/* STATUS */
.status-box {
    text-align: center;
    padding: 40px;
    font-size: 1.4rem;
    color: var(--primary);
    border: 2px dashed #8b5cf6;
    border-radius: 12px;
    margin-top: 25px;
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .page-wrapper {
        max-width: 95%;
        padding: 12px;
    }

    .title {
        font-size: 1.8rem;
        text-align: center;
    }

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

/* ANIMATION */
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
