<template>
    <div class="page-wrapper d-flex justify-content-center align-items-center py-4">
        <div class="container" style="max-width: 800px;">
            <div class="card shadow-lg border-0 rounded-4 overflow-hidden">

                <div class="card-header text-white py-3"
                    style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);">
                    <h4 class="mb-0 text-center fw-bold d-flex align-items-center justify-content-center gap-2">
                        <i class="fas fa-user-edit"></i>
                        Thông tin tài khoản
                    </h4>
                </div>

                <div class="card-body p-4 p-md-5 bg-white">
                    <div v-if="isLoadingData" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="text-muted mt-2">Đang tải thông tin...</p>
                    </div>

                    <form v-else @submit.prevent="submit" class="row g-3">

                        <div class="col-md-6">
                            <label class="form-label fw-bold text-secondary">Họ lót</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-0 rounded-start-pill ps-3"><i
                                        class="fas fa-user text-muted"></i></span>
                                <input v-model="form.HoLot" class="form-control bg-light border-0 rounded-end-pill py-2"
                                    required autocomplete="family-name" />
                            </div>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label fw-bold text-secondary">Tên</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-0 rounded-start-pill ps-3"><i
                                        class="fas fa-signature text-muted"></i></span>
                                <input v-model="form.Ten" class="form-control bg-light border-0 rounded-end-pill py-2"
                                    required autocomplete="given-name" />
                            </div>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label fw-bold text-secondary">Ngày sinh</label>
                            <input type="date" v-model="form.NgaySinh"
                                class="form-control bg-light border-0 rounded-pill py-2 px-3" />
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold text-secondary">Phái</label>
                            <select v-model="form.Phai" class="form-control bg-light border-0 rounded-pill py-2 px-3">
                                <option>Nam</option>
                                <option>Nữ</option>
                            </select>
                        </div>

                        <div class="col-12">
                            <label class="form-label fw-bold text-secondary">Địa chỉ</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-0 rounded-start-pill ps-3"><i
                                        class="fas fa-map-marker-alt text-muted"></i></span>
                                <input v-model="form.DIACHI"
                                    class="form-control bg-light border-0 rounded-end-pill py-2"
                                    autocomplete="street-address" />
                            </div>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label fw-bold text-secondary">Số điện thoại</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-0 rounded-start-pill ps-3"><i
                                        class="fas fa-phone text-muted"></i></span>
                                <input v-model="form.DienThoai"
                                    class="form-control bg-light border-0 rounded-end-pill py-2" required
                                    autocomplete="username" />
                            </div>
                        </div>

                        <div class="col-12 mt-4">
                            <hr class="text-muted">
                            <h6 class="text-primary fw-bold mb-3"><i class="fas fa-lock me-2"></i>Đổi mật khẩu</h6>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label fw-bold text-secondary">Mật khẩu mới</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-0 rounded-start-pill ps-3"><i
                                        class="fas fa-key text-muted"></i></span>
                                <input type="password" v-model="form.Password"
                                    class="form-control bg-light border-0 rounded-end-pill py-2"
                                    placeholder="Để trống nếu không đổi" autocomplete="new-password" />
                            </div>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label fw-bold text-secondary">
                                Mật khẩu cũ
                                <span v-if="form.Password" class="text-danger">*</span>
                            </label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-0 rounded-start-pill ps-3"><i
                                        class="fas fa-shield-alt text-muted"></i></span>
                                <input type="password" v-model="form.OldPassword"
                                    class="form-control bg-light border-0 rounded-end-pill py-2"
                                    :required="!!form.Password" :disabled="!form.Password"
                                    placeholder="Nhập mật khẩu hiện tại" autocomplete="current-password" />
                            </div>
                        </div>

                        <div class="col-12 mt-3">
                            <div v-if="errorMsg" class="alert alert-danger d-flex align-items-center" role="alert">
                                <i class="fas fa-exclamation-triangle me-2"></i> {{ errorMsg }}
                            </div>
                            <div v-if="successMsg" class="alert alert-success d-flex align-items-center" role="alert">
                                <i class="fas fa-check-circle me-2"></i> {{ successMsg }}
                            </div>
                        </div>

                        <div class="col-12 text-center mt-4">
                            <button :disabled="isSubmitting"
                                class="btn btn-gradient px-5 py-2 rounded-pill shadow hover-scale text-white fw-bold">
                                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                                <span v-else><i class="fas fa-save me-1"></i> Lưu thay đổi</span>
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
    HoLot: '',
    Ten: '',
    NgaySinh: '',
    Phai: '',
    DIACHI: '',
    DienThoai: '',
    Password: '',
    OldPassword: ''
})

const errorMsg = ref('')
const successMsg = ref('')
const isLoadingData = ref(true)
const isSubmitting = ref(false)

const load = async () => {
    isLoadingData.value = true
    try {
        const res = await api.get('/readers/me')
        const data = res.data

        form.HoLot = data.HOLOT || data.HoLot || ''
        form.Ten = data.TEN || data.Ten || ''

        if (data.NGAYSINH || data.NgaySinh) {
            const rawDate = data.NGAYSINH || data.NgaySinh
            form.NgaySinh = new Date(rawDate).toISOString().split('T')[0]
        }

        form.Phai = data.PHAI || data.Phai || 'Nam'
        form.DIACHI = data.DIACHI || data.DiaChi || ''
        form.DienThoai = data.DIENTHOAI || data.DienThoai || ''

    } catch (e) {
        if (e?.response?.status === 401) router.push('/login')
    } finally {
        isLoadingData.value = false
    }
}


const submit = async () => {
    errorMsg.value = ''
    successMsg.value = ''

    if (form.Password && !form.OldPassword) {
        errorMsg.value = 'Bạn phải nhập mật khẩu cũ để thay đổi mật khẩu mới.'
        return
    }

    isSubmitting.value = true

    try {
        const payload = {
            HoLot: form.HoLot,
            Ten: form.Ten,
            NgaySinh: form.NgaySinh,
            Phai: form.Phai,
            DIACHI: form.DIACHI,
            DienThoai: form.DienThoai,
        }

        if (form.Password) {
            payload.Password = form.Password
            payload.OldPassword = form.OldPassword
        }

        await api.put('/readers/me', payload)
        form.Password = ''
        form.OldPassword = ''

        const oldUser = JSON.parse(localStorage.getItem('readerUser') || '{}')

        const updatedUser = {
            ...oldUser,
            ...payload,
            HOLOT: form.HoLot,
            TEN: form.Ten
        }

        delete updatedUser.Password
        delete updatedUser.OldPassword

        localStorage.setItem('readerUser', JSON.stringify(updatedUser))

        successMsg.value = 'Cập nhật thông tin thành công!'

    } catch (e) {
        errorMsg.value = e?.response?.data?.message || 'Lỗi cập nhật'
    } finally {
        isSubmitting.value = false
    }
}
onMounted(load)
</script>

<style scoped>
.page-wrapper {
    min-height: 100vh;
    background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%);
}

.btn-gradient {
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
    border: none;
    transition: all 0.3s ease;
}

.hover-scale:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4) !important;
}

.form-control:focus,
.form-select:focus {
    box-shadow: none;
    background-color: #fff;
    border: 1px solid #8b5cf6;
}

.input-group-text {
    color: #6366f1;
}

.form-control:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
}
</style>