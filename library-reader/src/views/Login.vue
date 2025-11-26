<template>
    <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div class="card shadow-lg border-0" style="max-width: 420px; width: 100%; border-radius: 0.75rem;">

            <!-- Header -->
            <div class="card-header text-center text-white"
                style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899); border-radius: 0.75rem 0.75rem 0 0;">
                <h4 class="mb-0 font-weight-bold">Đăng nhập Độc giả</h4>
            </div>

            <!-- Form -->
            <div class="card-body">
                <form @submit.prevent="submit">

                    <!-- Phone -->
                    <div class="form-group">
                        <label class="font-weight-semibold">Số điện thoại</label>
                        <input v-model="form.DIENTHOAI" class="form-control" required autocomplete="username">
                    </div>

                    <!-- Password -->
                    <div class="form-group mt-3">
                        <label class="font-weight-semibold">Mật khẩu</label>
                        <input type="password" v-model="form.PASSWORD" class="form-control" required
                            autocomplete="current-password">

                    </div>

                    <!-- Register link -->
                    <div class="mt-2 mb-3">
                        <router-link to="/register" class="text-secondary small">
                            Bạn chưa có tài khoản? Đăng ký!
                        </router-link>
                    </div>

                    <!-- Submit button -->
                    <button class="btn w-100 text-white py-2" style="background: blue; border-radius: 6px;">
                        Đăng nhập
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>


<script setup>
import { reactive } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = reactive({ DIENTHOAI: '', PASSWORD: '' })

const submit = async () => {
    try {
        const res = await api.post('/auth/reader-login', { DIENTHOAI: form.DIENTHOAI, PASSWORD: form.PASSWORD })
        const { token, reader, message } = res.data
        // Save token under reader-specific key to avoid collision with admin
        localStorage.setItem('reader_token', token)
        alert(message || 'Đăng nhập thành công')
        router.push('/')
    } catch (e) {
        alert(e?.response?.data?.message || 'Lỗi đăng nhập')
    }
}
</script>

<style scoped>
.container {
    max-width: 600px;
    margin: 48px auto;
    padding: 16px;
    background: white;
    border-radius: 6px
}

input {
    width: 100%;
    padding: 8px;
    margin: 6px 0
}

button {
    padding: 8px 12px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 4px
}
</style>
