<template>
    <div class="container mt-5">
        <div class="card shadow-lg border-0 rounded-lg">

            <!-- HEADER -->
            <div class="card-header text-white d-flex align-items-center justify-content-between"
                style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);">
                <h3 class="mb-0">{{ isEdit ? 'Sửa Phiếu Mượn' : 'Tạo Phiếu Mượn Mới' }}</h3>
                <i class="fas fa-book-reader fa-lg"></i>
            </div>

            <!-- BODY -->
            <div class="card-body bg-white p-5 rounded-bottom">
                <form @submit.prevent="saveBorrowing">
                    <div class="row">

                        <!-- Cột trái -->
                        <div class="col-md-6">
                            <div class="form-group mb-4">
                                <label class="font-weight-bold">Mã mượn</label>
                                <div class="input-group">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text"><i class="fas fa-hashtag"></i></span>
                                    </div>
                                    <input v-model="borrowing.MaMuon" type="text" class="form-control form-control-lg"
                                        :disabled="isEdit" required>
                                </div>
                            </div>

                            <div class="form-group mb-4">
                                <label class="font-weight-bold">Mã độc giả</label>
                                <div class="input-group">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text"><i class="fas fa-user"></i></span>
                                    </div>
                                    <input v-model="borrowing.MaDocGia" type="text" class="form-control form-control-lg"
                                        required>
                                </div>
                            </div>

                            <div class="form-group mb-4">
                                <label class="font-weight-bold">Mã sách</label>
                                <div class="input-group">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text"><i class="fas fa-book"></i></span>
                                    </div>
                                    <input v-model="borrowing.MaSach" type="text" class="form-control form-control-lg"
                                        required>
                                </div>
                            </div>
                        </div>

                        <!-- Cột phải -->
                        <div class="col-md-6">
                            <div class="form-group mb-4">
                                <label class="font-weight-bold">Ngày mượn</label>
                                <input v-model="borrowing.NgayMuon" type="date" class="form-control form-control-lg"
                                    required>
                            </div>

                            <div class="form-group mb-4">
                                <label class="font-weight-bold">Ngày trả</label>
                                <input v-model="borrowing.NgayTra" type="date" class="form-control form-control-lg"
                                    required>
                            </div>

                            <div class="form-group mb-4">
                                <label class="font-weight-bold">Trạng thái</label>
                                <select v-model="borrowing.TrangThai" class="form-control form-control-lg"
                                    :disabled="!isEdit">
                                    <option>ChoDuyet</option>
                                    <option>DaDuyet</option>
                                    <option>DaMuon</option>
                                    <option>DaTra</option>
                                    <option>QuaHan</option>
                                </select>
                            </div>
                        </div>

                    </div>

                    <!-- Nút hành động -->
                    <div class="d-flex justify-content-end mt-4">
                        <button type="button" @click="$router.go(-1)" class="btn btn-secondary btn-lg mr-3">
                            <i class="fas fa-times mr-1"></i> Hủy
                        </button>
                        <button type="submit" class="btn btn-primary btn-lg px-5">
                            <i class="fas fa-save mr-1"></i> Lưu
                        </button>
                    </div>

                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

const route = useRoute()
const router = useRouter()
const isEdit = route.params.id !== undefined
const borrowing = ref({
    MaMuon: '',
    MaDocGia: '',
    MaSach: '',
    NgayMuon: '',
    NgayTra: '',
    TrangThai: 'ChoDuyet'
})

const fetchBorrowing = async () => {
    if (isEdit) {
        const res = await api.get(`/borrowings/${route.params.id}`)
        borrowing.value = res.data
    }
}

const saveBorrowing = async () => {
    try {
        if (isEdit) {
            await api.put(`/borrowings/${route.params.id}`, borrowing.value)
        } else {
            await api.post('/borrowings', borrowing.value)
        }
        router.push('/borrowings')
    } catch (err) {
        alert(err.response?.data?.message || 'Lỗi lưu phiếu mượn')
    }
}

onMounted(fetchBorrowing)
</script>

<style scoped>
.card-header h3 {
    font-weight: 700;
}

.input-group-text {
    background-color: #f1f1f1;
}

.btn:hover {
    opacity: 0.9;
}

.card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.card-body {
    background-color: #fff;
}
</style>
