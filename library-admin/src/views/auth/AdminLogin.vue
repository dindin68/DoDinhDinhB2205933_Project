<template>
    <div class="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div class="card shadow-lg border-0" style="width: 420px; border-radius: 0.75rem;">

            <!-- Header Gradient -->
            <div class="card-body text-white text-center"
                style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899); border-radius: 0.75rem 0.75rem 0 0;">
                <h3 class="mb-0 font-weight-bold">Đăng nhập Admin</h3>
            </div>

            <!-- Form -->
            <div class="card-body">
                <form @submit.prevent="submit">

                    <!-- Phone -->
                    <div class="form-group">
                        <label class="font-weight-semibold">Số điện thoại</label>
                        <input v-model="username" required autocomplete="username" class="form-control" />
                    </div>

                    <!-- Password -->
                    <div class="form-group mt-3">
                        <label class="font-weight-semibold">Mật khẩu</label>
                        <input v-model="password" type="password" required autocomplete="current-password"
                            class="form-control" />
                    </div>

                    <!-- Error -->
                    <div v-if="error" class="text-danger small mt-2">
                        {{ error }}
                    </div>

                    <!-- Buttons -->
                    <button class="btn w-100 text-white py-2" :disabled="loading"
                        style="background: blue; border-radius: .3rem;">
                        {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref } from 'vue'
import api from '@/api'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const router = useRouter()

const submit = async () => {
    error.value = ''
    loading.value = true
    try {
        // Gửi đúng field backend yêu cầu
        const res = await api.post('/auth/login', {
            SoDienThoai: username.value.trim(),
            Password: password.value.trim()
        })

        console.debug('login response', res.data)

        const { token, employee } = res.data

        if (!token) {
            error.value = 'Đăng nhập thất bại'
            loading.value = false
            return
        }

        // store admin token under separate key to avoid collision with reader
        localStorage.setItem('admin_token', token)
        localStorage.setItem('adminUser', JSON.stringify(employee || {}))

        const redirect = router.currentRoute.value.query.redirect || '/'
        router.push(redirect)
    } catch (err) {
        console.error('Login error', err)
        error.value = err?.response?.data?.message || 'Lỗi khi đăng nhập'
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.min-h-screen {
    min-height: 100vh;
}
</style>
