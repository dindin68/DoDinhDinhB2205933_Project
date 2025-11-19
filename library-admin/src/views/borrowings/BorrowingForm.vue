<template>
    <div class="container mt-5">
        <div class="card shadow-lg border-0">
            <div class="card-header bg-warning text-dark">
                <h3 class="mb-0">{{ isEdit ? 'Sửa Phiếu Mượn' : 'Tạo Phiếu Mượn Mới' }}</h3>
            </div>
            <div class="card-body p-5">
                <form @submit.prevent="saveBorrowing">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group mb-4">
                                <label class="font-weight-bold">Mã mượn</label>
                                <input v-model="borrowing.MaMuon" type="text" class="form-control form-control-lg"
                                    :disabled="isEdit" required>
                            </div>
                            <div class="form-group mb-4">
                                <label class="font-weight-bold">Mã độc giả</label>
                                <input v-model="borrowing.MaDocGia" type="text" class="form-control form-control-lg"
                                    required>
                            </div>
                            <div class="form-group mb-4">
                                <label class="font-weight-bold">Mã sách</label>
                                <input v-model="borrowing.MaSach" type="text" class="form-control form-control-lg"
                                    required>
                            </div>
                        </div>
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
                    <div class="text-right mt-4">
                        <button type="button" @click="$router.go(-1)" class="btn btn-secondary btn-lg mr-3">Hủy</button>
                        <button type="submit" class="btn btn-success btn-lg px-5">Lưu</button>
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