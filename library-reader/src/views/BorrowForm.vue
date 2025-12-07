<template>
    <div>
        <div class="position-absolute mt-3 ml-3 " style="z-index: 10;">
            <button @click="$router.back()"
                class="btn btn-light btn-sm shadow-sm rounded-pill px-3 fw-bold text-primary back-btn">
                <i class="fas fa-arrow-left me-1"></i> Quay lại
            </button>
        </div>

        <div class="container d-flex justify-content-center align-items-center min-vh-100 rounded-lg">
            <div class="card shadow-lg p-4 w-100 borrow-card border-0">

                <h3 class="text-center mb-4 title-gradient">
                    <i class="fas fa-book-reader me-2"></i>Yêu cầu mượn sách
                </h3>

                <div v-if="!book" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                    <p class="text-muted mt-2">Đang tải thông tin sách...</p>
                </div>

                <div v-else>
                    <div class="text-center mb-4">
                        <h5 class="font-weight-bold text-dark mb-1">
                            {{ book.TenSach || book.title }}
                        </h5>
                        <small class="text-muted">Mã sách: {{ book.MaSach || book._id }}</small>
                    </div>

                    <div class="alert alert-light border-start border-4 border-primary bg-light shadow-sm mb-4">
                        <h6 class="text-primary fw-bold mb-2"><i class="fas fa-info-circle me-1"></i> Lưu ý quan trọng:
                        </h6>
                        <ul class="mb-0 ps-3 text-secondary small" style="list-style-type: circle;">
                            <li v-if="book.GhiChu">{{ book.GhiChu }}</li>

                            <li>Bạn chỉ được mượn tối đa <strong>5 quyển sách</strong> cùng lúc.</li>
                            <li>Nếu trả muộn <strong>>= 5 lần</strong>, hệ thống sẽ chặn quyền mượn.</li>
                            <li>Hãy đọc và giữ gìn sách cẩn thận, trả đúng hạn nhé! <i class="fa-solid fa-heart"
                                    style="color: #f91a31;"></i> </li>
                        </ul>
                    </div>

                    <form @submit.prevent="submit">
                        <div class="row">
                            <div class="col-12 col-md-6 mb-3">
                                <label class="fw-bold small text-muted mb-1">Ngày mượn</label>
                                <input type="date" class="form-control" v-model="form.NgayMuon" :min="minDate"
                                    required />
                            </div>

                            <div class="col-12 col-md-6 mb-3">
                                <label class="fw-bold small text-muted mb-1">Ngày trả dự kiến</label>
                                <input type="date" class="form-control" v-model="form.NgayTra" :min="form.NgayMuon"
                                    required />
                            </div>
                        </div>

                        <button class="btn btn-gradient btn-block w-100 py-2 mt-2 rounded-pill shadow-sm">
                            Gửi yêu cầu <i class="fas fa-paper-plane ms-1"></i>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api' // Đảm bảo đường dẫn đúng
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const book = ref(null)

// Tính ngày hôm nay format YYYY-MM-DD
const today = new Date().toISOString().split('T')[0]

// Tính ngày trả mặc định (hôm nay + 7 ngày)
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
const defaultReturnDate = nextWeek.toISOString().split('T')[0];

const form = ref({
    NgayMuon: today,
    NgayTra: defaultReturnDate
})

// Chặn không cho chọn ngày quá khứ
const minDate = computed(() => today)

onMounted(async () => {
    //  Check Login
    const token = localStorage.getItem('reader_token')
    if (!token) {
        router.push('/login')
        return
    }

    // Fetch Book Info
    try {
        const res = await api.get(`/books/${route.params.bookId}`)
        book.value = res.data
    } catch (e) {
        console.error("Lỗi tải sách:", e)
        alert("Không thể tải thông tin sách.")
        router.back()
    }
})

const submit = async () => {
    // Validate cơ bản phía client
    if (new Date(form.value.NgayTra) < new Date(form.value.NgayMuon)) {
        alert("Ngày trả không được nhỏ hơn ngày mượn!")
        return;
    }

    try {
        const payload = {
            MaSach: book.value.MaSach || book.value._id,
            NgayMuon: form.value.NgayMuon,
            NgayTra: form.value.NgayTra
        }

        await api.post('/borrowings', payload)

        // Thành công -> Chuyển hướng
        if (confirm('Gửi yêu cầu thành công! Xem danh sách phiếu mượn?')) {
            router.push('/my-borrowings')
        }
    } catch (e) {
        console.error('Lỗi mượn sách', e)
        if (e?.response?.status === 401) {
            alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.')
            localStorage.removeItem('reader_token')
            router.push('/login')
            return
        }
        // Hiển thị lỗi từ backend (ví dụ: Đang mượn quá 5 quyển)
        alert(e?.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu.')
    }
}
</script>

<style scoped>
.container {
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
    min-height: 100vh;
    padding: 20px;
}

.borrow-card {
    max-width: 500px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    backdrop-filter: blur(10px);
}

.title-gradient {
    font-weight: 800;
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.btn-gradient {
    border: none;
    color: #fff;
    font-weight: bold;
    font-size: 1.1rem;
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
    background-size: 200% auto;
    transition: 0.5s;
}

.btn-gradient:hover {
    background-position: right center;
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(236, 72, 153, 0.4);
}

.form-control {
    border-radius: 10px;
    padding: 10px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s;
}

.form-control:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
}

.back-btn {
    transition: transform 0.2s;
}

.back-btn:hover {
    transform: translateX(-3px);
}
</style>