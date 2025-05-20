<template>
  <div class="company-profile">
    <div class="profile-header">
      <h1>회사 정보</h1>
    </div>

    <div class="profile-content">
      <div class="profile-section">
        <h2>기본 정보</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>회사명</label>
            <span>{{ company.name }}</span>
          </div>
          <div class="info-item">
            <label>사업자등록번호</label>
            <span>{{ company.businessNumber }}</span>
          </div>
          <div class="info-item">
            <label>대표자명</label>
            <span>{{ company.ownerName }}</span>
          </div>
          <div class="info-item">
            <label>연락처</label>
            <span>{{ company.phone }}</span>
          </div>
          <div class="info-item">
            <label>이메일</label>
            <span>{{ company.email }}</span>
          </div>
          <div class="info-item">
            <label>주소</label>
            <span>{{ company.address }}</span>
          </div>
        </div>
      </div>

      <div class="profile-section">
        <h2>처리 시설 정보</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>시설명</label>
            <span>{{ company.facilityName }}</span>
          </div>
          <div class="info-item">
            <label>허가 번호</label>
            <span>{{ company.facilityLicenseNumber }}</span>
          </div>
          <div class="info-item">
            <label>허가 만료일</label>
            <span>{{ formatDate(company.facilityLicenseExpiry) }}</span>
          </div>
        </div>
      </div>

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
import { ref } from 'vue'

export default {
  name: 'ProcessorProfile',
  setup() {
    // 실제로는 store에서 회사 정보를 가져와야 합니다.
    // 아래는 예시 데이터입니다.
    const company = ref({
      name: '처리업체(주)',
      businessNumber: '987-65-43210',
      ownerName: '이몽룡',
      phone: '010-9876-5432',
      email: 'processor@example.com',
      address: '경기도 성남시 분당구 판교로 456',
      facilityName: '처리시설A',
      facilityLicenseNumber: 'F-2023-0001',
      facilityLicenseExpiry: '2026-06-30',
      bankName: '신한은행',
      bankAccountNumber: '987654-32-109876',
      bankAccountHolder: '처리업체(주)'
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
