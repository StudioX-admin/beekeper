      <div class="profile-section">
        <h2>계좌 정보</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>은행명</label>
            <span>{{ company.bankName }}</span>
          </div>
          <div class="info-item">
            <label>계좌번호</label>
            <span>{{ company.bankAccountNumber }}</span>
          </div>
          <div class="info-item">
            <label>예금주</label>
            <span>{{ company.bankAccountHolder }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'TransporterProfile',
  setup() {
    // 실제로는 store에서 회사 정보를 가져와야 합니다.
    // 아래는 예시 데이터입니다.
    const company = ref({
      name: '수거업체(주)',
      businessNumber: '123-45-67890',
      ownerName: '홍길동',
      phone: '010-1234-5678',
      email: 'transporter@example.com',
      address: '서울특별시 강남구 테헤란로 123',
      transportLicenseNumber: 'T-2023-0001',
      transportLicenseExpiry: '2025-12-31',
      bankName: '국민은행',
      bankAccountNumber: '123456-78-901234',
      bankAccountHolder: '수거업체(주)'
    })

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      return d.toLocaleDateString()
    }

    return {
      company,
      formatDate
    }
  }
}
</script>

<style scoped>
.company-profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  margin-bottom: 2rem;
}

.profile-header h1 {
  font-size: 1.8rem;
  color: var(--text-primary);
}

.profile-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-section h2 {
  font-size: 1.4rem;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.info-item span {
  font-size: 1.1rem;
  color: var(--text-primary);
}
</style>
