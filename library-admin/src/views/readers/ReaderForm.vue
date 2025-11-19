<template>
    <div class="container mx-0">
        <div class="card shadow-lg border-0" style=" border-radius: 0.5rem;">
            <div class="card-header bg-success text-white" style=" border-radius: 0.5rem;">
                <h3 class="mb-0">{{ isEdit ? 'Sửa Độc Giả' : 'Thêm Độc Giả Mới' }}</h3>
            </div>
            <div class="card-body p-5"
                style="background: linear-gradient(90deg, #10b981, #3b82f6); border-radius: 0.5rem;">
                <form @submit.prevent="saveReader">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group mb-4">
                                <label class="font-weight-bold">Mã độc giả</label>
                                <input v-model="reader.MaDocGia" type="text" class="form-control form-control-lg"
                                    :disabled="isEdit" required>
                            </div>
                            <div class="form-group mb-4">
                                <label class="font-weight-bold">Họ lót</label>
                                <input v-model="reader.HoLot" type="text" class="form-control form-control-lg" required>
                            </div>
                            <div class="form-group mb-4">
                                <label class="font-weight-bold">Tên</label>
                                <input v-model="reader.Ten" type="text" class="form-control form-control-lg" required>
                            </div>
                            <div class="form-group mb-4">
                                <label class="font-weight-bold">Ngày sinh</label>
                                <input v-model="reader.NgaySinh" type="date" class="form-control form-control-lg">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group mb-4">
                                <label class="font-weight-bold">Phái</label>
                                <select v-model="reader.Phai" class="form-control form-control-lg">
                                    <option>Nam</option>
                                    <option>Nữ</option>
                                </select>
                            </div>
                            <div class="form-group mb-4">
                                <label class="font-weight-bold">Địa chỉ</label>
                                <input v-model="reader.DiaChi" type="text" class="form-control form-control-lg">
                            </div>
                            <div class="form-group mb-4">
                                <label class="font-weight-bold">Điện thoại</label>
                                <input v-model="reader.DienThoai" type="text" class="form-control form-control-lg">
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
const reader = ref({
    MaDocGia: '',
    HoLot: '',
    Ten: '',
    NgaySinh: '',
    Phai: 'Nam',
    DiaChi: '',
    DienThoai: ''
})

const fetchReader = async () => {
    if (isEdit) {
        const res = await api.get(`/readers/${route.params.id}`)
        reader.value = res.data
    }
}

const saveReader = async () => {
    try {
        if (isEdit) {
            await api.put(`/readers/${route.params.id}`, reader.value)
        } else {
            await api.post('/readers', reader.value)
        }
        router.push('/readers')
    } catch (err) {
        alert(err.response?.data?.message || 'Lỗi lưu độc giả')
    }
}

onMounted(fetchReader)
</script>