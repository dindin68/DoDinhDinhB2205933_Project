<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
            <h2 class="text-2xl font-bold mb-4 text-center">Đăng nhập Admin</h2>

            <form @submit.prevent="submit">
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">Số điện thoại</label>
                    <input v-model="username" required class="w-full px-3 py-2 border rounded" />
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">Mật khẩu</label>
                    <input v-model="password" type="password" required class="w-full px-3 py-2 border rounded" />
                </div>

                <div v-if="error" class="text-sm text-red-600 mb-3">{{ error }}</div>

                <div class="flex items-center justify-between">
                    <button class="bg-indigo-600 text-white px-4 py-2 rounded" :disabled="loading">
                        {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
                    </button>
                    <router-link to="/" class="text-sm text-gray-500">Quay lại</router-link>
                </div>
            </form>
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

        localStorage.setItem('token', token)
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
