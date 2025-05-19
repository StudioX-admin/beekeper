 <template>
  <div class="notice-detail">
    <h1>{{ notice.title }}</h1>
    <div class="notice-meta">
      <span>{{ formatDate(notice.createdAt) }}</span>
    </div>
    <div class="notice-content" v-html="notice.content"></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { formatDate } from '@/utils/date'
import axios from 'axios'

export default {
  name: 'NoticeDetail',
  setup() {
    const route = useRoute()
    const notice = ref({})

    const fetchNotice = async () => {
      try {
        const response = await axios.get(`/api/notices/${route.params.id}`)
        notice.value = response.data
      } catch (error) {
        console.error('Failed to fetch notice:', error)
      }
    }

    onMounted(fetchNotice)

    return {
      notice,
      formatDate
    }
  }
}
</script>

<style scoped>
.notice-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.notice-meta {
  color: #666;
  margin-bottom: 1rem;
}

.notice-content {
  line-height: 1.6;
}
</style> 
