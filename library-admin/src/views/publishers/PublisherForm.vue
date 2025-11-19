<template>
    <div class="container mt-5">
        <div class="card shadow-lg border-0">
            <div class="card-header bg-info text-white">
                <h3 class="mb-0">{{ isEdit ? 'Sửa Nhà Xuất Bản' : 'Thêm Nhà Xuất Bản Mới' }}</h3>
            </div>
            <div class="card-body p-5">
                <form @submit.prevent="savePublisher">
                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Mã NXB</label>
                        <input v-model="publisher.MaNXB" type="text" class="form-control form-control-lg"
                            :disabled="isEdit" required>
                    </div>
                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Tên NXB</label>
                        <input v-model="publisher.TenNXB" type="text" class="form-control form-control-lg" required>
                    </div>
                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Địa chỉ</label>
                        <input v-model="publisher.DiaChi" type="text" class="form-control form-control-lg">
                    </div>
                    <div class="text-right">
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
const publisher = ref({
    MaNXB: '',
    TenNXB: '',
    DiaChi: ''
})

const fetchPublisher = async () => {
    if (isEdit) {
        const res = await api.get(`/publishers/${route.params.id}`)
        publisher.value = res.data
    }
}

const savePublisher = async () => {
    try {
        if (isEdit) {
            await api.put(`/publishers/${route.params.id}`, publisher.value)
        } else {
            await api.post('/publishers', publisher.value)
        }
        router.push('/publishers')
    } catch (err) {
        alert(err.response?.data?.message || 'Lỗi lưu nhà xuất bản')
    }
}

onMounted(fetchPublisher)
</script>