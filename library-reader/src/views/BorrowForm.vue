<template>
    <div class="position-absolute mt-3 ml-3">
        <button @click="$router.back()" class="btn btn-outline-light btn-sm shadow back-btn">
            ← Quay lại
        </button>
    </div>
    <div class="page d-flex justify-content-center align-items-center">
        <div class="card shadow-lg p-4 w-100 borrow-card">

            <h3 class="text-center mb-4 title-gradient">
                Yêu cầu mượn sách
            </h3>

            <div v-if="!book" class="text-center text-muted">
                Đang tải thông tin sách...
            </div>

            <div v-else>
                <p class="font-weight-bold mb-3">
                    Sách:
                    <span class="text-primary">
                        {{ book.TenSach || book.title }}
                    </span>
                </p>

                <form @submit.prevent="submit">
                    <div class="form-group">
                        <label>Ngày mượn</label>
                        <input type="date" class="form-control" v-model="form.NgayMuon" required />
                    </div>

                    <div class="form-group">
                        <label>Ngày trả dự kiến</label>
                        <input type="date" class="form-control" v-model="form.NgayTra" required />
                    </div>

                    <button class="btn btn-gradient btn-block mt-3">
                        Gửi yêu cầu
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const book = ref(null)
const form = ref({ NgayMuon: '', NgayTra: '' })

onMounted(async () => {
    try {
        const res = await api.get(`/books/${route.params.bookId}`)
        book.value = res.data
    } catch (e) { }
})

// Require reader login: if no reader_token, redirect to login
onMounted(() => {
    const token = localStorage.getItem('reader_token')
    if (!token) {
        // send user to reader login
        router.push('/login')
    }
})

const submit = async () => {
    try {
        // basic payload. Backend now requires Authorization Bearer token (reader_token)
        await api.post('/borrowings', { MaSach: book.value.MaSach || book.value._id, NgayMuon: form.value.NgayMuon, NgayTra: form.value.NgayTra })
        alert('Yêu cầu mượn đã gửi')
        router.push('/my-borrowings')
    } catch (e) {
        console.error('Borrow submit error', e)
        if (e?.response?.status === 401) {
            alert('Bạn cần đăng nhập để mượn sách')
            router.push('/login')
            return
        }
        alert(e?.response?.data?.message || 'Lỗi gửi yêu cầu')
    }
}
</script>

<style scoped>
.page {
    border-radius: 10px;
    padding: 2%;
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
}

.borrow-card {
    max-width: 480px;
    border-radius: 16px;
    animation: fadeIn 0.4s ease;
}

/* Tiêu đề gradient */
.title-gradient {
    font-weight: 800;
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Button gradient */
.btn-gradient {
    border: none;
    color: #fff;
    font-weight: bold;
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
    transition: 0.3s;
}

.btn-gradient:hover {
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
}

/* Input focus đẹp hơn Bootstrap mặc định */
.form-control:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 0.2rem rgba(139, 92, 246, 0.25);
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

/* Animation mượt */
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
