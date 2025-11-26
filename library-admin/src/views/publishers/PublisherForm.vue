<template>
    <div class="container mt-5">
        <div class="card shadow-lg border-0 rounded-lg">

            <!-- HEADER -->
            <div class="card-header text-white d-flex align-items-center justify-content-between"
                style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899); border-radius: 0.5rem;">
                <h3 class="mb-0">{{ isEdit ? 'Sửa Nhà Xuất Bản' : 'Thêm Nhà Xuất Bản Mới' }}</h3>
                <i class="fas fa-book fa-lg"></i>
            </div>

            <!-- BODY -->
            <div class="card-body p-5">
                <form @submit.prevent="savePublisher">
                    <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

                    <!-- Mã NXB (chỉ hiển thị khi edit) -->
                    <div v-if="isEdit" class="form-group mb-4">
                        <label class="font-weight-bold">Mã NXB</label>
                        <input v-model="publisher.MaNXB" type="text" class="form-control form-control-lg" disabled>
                    </div>

                    <!-- Tên NXB -->
                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Tên NXB</label>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text"><i class="fas fa-edit"></i></span>
                            </div>
                            <input v-model="publisher.TenNXB" type="text" class="form-control form-control-lg" required>
                        </div>
                    </div>

                    <!-- Địa chỉ -->
                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Địa chỉ</label>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text"><i class="fas fa-map-marker-alt"></i></span>
                            </div>
                            <input v-model="publisher.DiaChi" type="text" class="form-control form-control-lg">
                        </div>
                    </div>

                    <!-- Nút hành động -->
                    <div class="d-flex justify-content-end">
                        <button type="button" @click="$router.go(-1)" class="btn btn-secondary btn-lg mr-3">
                            <i class="fas fa-times mr-1"></i> Hủy
                        </button>
                        <button type="submit" class="btn btn-success btn-lg px-5">
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

const errorMsg = ref('')
const savePublisher = async () => {
    errorMsg.value = ''
    if (!publisher.value.TenNXB || publisher.value.TenNXB.trim() === '') {
        errorMsg.value = "Vui lòng nhập tên nhà xuất bản"
        return
    }
    try {
        if (isEdit) {
            await api.put(`/publishers/${route.params.id}`, publisher.value)
        } else {
            await api.post('/publishers', publisher.value)
        }
        router.push('/publishers')
    } catch (err) {
        errorMsg.value = err.response?.data?.message || 'Lỗi lưu nhà xuất bản'
    }
}


onMounted(fetchPublisher)
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
</style>
