<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">

    <div class="card shadow-lg border-0" style="max-width: 720px; width:100%; border-radius: 0.75rem;">

      <!-- Header -->
      <div class="card-header text-white text-center" style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899); 
               border-radius: 0.75rem 0.75rem 0 0;">
        <h4 class="mb-0 font-weight-bold">Đăng ký độc giả</h4>
      </div>

      <!-- Body -->
      <div class="card-body px-4 py-4">

        <!-- Error -->
        <div v-if="errorMsg" class="alert alert-danger py-2">
          {{ errorMsg }}
        </div>

        <form @submit.prevent="submit">
          <div class="row">

            <!-- Họ lót -->
            <div class="form-group col-md-6">
              <label>Họ lót</label>
              <input v-model="form.HOLOT" class="form-control" required autocomplete="given-name">
            </div>

            <!-- Tên -->
            <div class="form-group col-md-6">
              <label>Tên</label>
              <input v-model="form.TEN" class="form-control" required autocomplete="family-name">
            </div>

            <!-- Ngày sinh -->
            <div class="form-group col-md-6">
              <label>Ngày sinh</label>
              <input type="date" v-model="form.NGAYSINH" class="form-control" autocomplete="bday">
            </div>

            <!-- Phái -->
            <div class="form-group col-md-6">
              <label>Phái</label>
              <select v-model="form.PHAI" class="form-control">
                <option>Nam</option>
                <option>Nữ</option>
              </select>
            </div>

            <!-- Địa chỉ (full row) -->
            <div class="form-group col-md-12">
              <label>Địa chỉ</label>
              <input v-model="form.DIACHI" class="form-control" autocomplete="street-address">
            </div>

            <!-- Số điện thoại -->
            <div class="form-group col-md-6">
              <label>Số điện thoại</label>
              <input v-model="form.DIENTHOAI" class="form-control" required autocomplete="tel">
            </div>

            <!-- Mật khẩu -->
            <div class="form-group col-md-6">
              <label>Mật khẩu</label>
              <input type="password" v-model="form.PASSWORD" class="form-control" required autocomplete="new-password">
            </div>

          </div>

          <!-- Submit -->
          <button class="btn w-100 text-white py-2 mt-2"
            style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899); border-radius: 6px;">
            Đăng ký
          </button>

        </form>

        <div class="mt-4 mb-2 text-center">
          <router-link to="/login" class="text-secondary small">
            Quay lại đăng nhập!
          </router-link>
        </div>

      </div>
    </div>

  </div>
</template>




<script setup>
import { reactive, ref } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = reactive({ HOLOT: '', TEN: '', NGAYSINH: '', PHAI: 'Nam', DIACHI: '', DIENTHOAI: '', PASSWORD: '' })
const errorMsg = ref("")

const submit = async () => {
  errorMsg.value = ""
  try {
    await api.post('/readers', form)
    alert('Đăng ký thành công')
    router.push('/login')
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || 'Lỗi đăng ký'
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
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px
}
</style>
