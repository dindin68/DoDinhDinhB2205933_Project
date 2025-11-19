<template>
  <div class="container">
    <h2>Đăng ký</h2>
    <form @submit.prevent="submit">
      <div>
        <label>Họ tên</label>
        <input v-model="form.TenDocGia" required />
      </div>
      <div>
        <label>Số điện thoại</label>
        <input v-model="form.DienThoai" required />
      </div>
      <div>
        <label>Mật khẩu</label>
        <input type="password" v-model="form.Password" required />
      </div>
      <button>Đăng ký</button>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = reactive({ TenDocGia: '', DienThoai: '', Password: '' })

const submit = async () => {
  try {
    await api.post('/readers', form)
    alert('Đăng ký thành công')
    router.push('/login')
  } catch (e) {
    alert(e?.response?.data?.message || 'Lỗi đăng ký')
  }
}
</script>

<style scoped>
.container { max-width: 600px; margin: 48px auto; padding: 16px; background: white; border-radius: 6px }
input { width: 100%; padding: 8px; margin: 6px 0 }
button { padding: 8px 12px; background: #2563eb; color: white; border: none; border-radius: 4px }
</style>
