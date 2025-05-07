<template>
  <div class="waste-request-detail">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="request-container">
      <div class="header">
        <h1>{{ request.title }}</h1>
        <div class="status-badge" :class="request.status.toLowerCase()">
          {{ request.status }}
        </div>
      </div>

      <div class="request-info">
        <div class="info-section">
          <h2>Request Details</h2>
          <div class="info-grid">
            <div class="info-item">
              <strong>Request ID:</strong>
              <span>{{ request.id }}</span>
            </div>
            <div class="info-item">
              <strong>Created:</strong>
              <span>{{ formatDate(request.createdAt) }}</span>
            </div>
            <div class="info-item">
              <strong>Waste Type:</strong>
              <span>{{ request.wasteType }}</span>
            </div>
            <div class="info-item">
              <strong>Quantity:</strong>
              <span>{{ request.quantity }} kg</span>
            </div>
            <div class="info-item">
              <strong>Pickup Date:</strong>
              <span>{{ formatDate(request.pickupDate) }}</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2>Description</h2>
          <p>{{ request.description }}</p>
        </div>

        <div class="info-section">
          <h2>Contact Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <strong>Name:</strong>
              <span>{{ request.contactName }}</span>
            </div>
            <div class="info-item">
              <strong>Phone:</strong>
              <span>{{ request.contactPhone }}</span>
            </div>
            <div class="info-item">
              <strong>Email:</strong>
              <span>{{ request.contactEmail }}</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2>Pickup Location</h2>
          <p>{{ request.location }}</p>
          <div id="map" class="map-container"></div>
        </div>

        <div class="info-section" v-if="request.notes">
          <h2>Additional Notes</h2>
          <p>{{ request.notes }}</p>
        </div>

        <div class="actions">
          <button 
            v-if="canUpdateStatus" 
            @click="updateStatus('Approved')"
            class="btn approve-btn"
            :disabled="request.status === 'Approved' || actionLoading"
          >
            Approve
          </button>
          <button 
            v-if="canUpdateStatus" 
            @click="updateStatus('Rejected')"
            class="btn reject-btn"
            :disabled="request.status === 'Rejected' || actionLoading"
          >
            Reject
          </button>
          <button 
            v-if="canUpdateStatus" 
            @click="updateStatus('Completed')"
            class="btn complete-btn"
            :disabled="request.status === 'Completed' || actionLoading"
          >
            Mark as Completed
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Import leaflet
import L from 'leaflet';
// You need to import CSS as well
import 'leaflet/dist/leaflet.css';

export default {
  name: 'WasteRequestDetail',
  data() {
    return {
      request: {},
      loading: true,
      error: null,
      map: null,
      marker: null,
      actionLoading: false,
      canUpdateStatus: false
    };
  },
  methods: {
    async fetchRequestDetails() {
      try {
        this.loading = true;
        // For demo purposes, mock data
        // In a real app, you would fetch from API
        // const response = await this.$api.wasteRequests.getById(this.$route.params.id);
        
        // Mock data for demo
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.request = {
          id: 'WR-2024-001',
          title: 'Plastic Waste Collection',
          status: 'Pending',
          createdAt: new Date('2024-05-01'),
          wasteType: 'Plastic',
          quantity: 50,
          pickupDate: new Date('2024-05-15'),
          location: '123 Main St, Seoul, South Korea',
          description: 'Collection of plastic waste from our office building. Mainly consists of plastic bottles and packaging materials.',
          contactName: 'Kim Min-ji',
          contactPhone: '010-1234-5678',
          contactEmail: 'minji.kim@example.com',
          notes: 'Please come between 9 AM and 5 PM. Security will be notified of your arrival.',
          coordinates: [37.5665, 126.9780] // Seoul coordinates
        };
        
        this.loading = false;
        this.canUpdateStatus = true; // In real app, check user permissions
        
        // Initialize map after data is loaded
        this.$nextTick(() => {
          this.initializeMap();
        });
      } catch (err) {
        this.error = 'Failed to load request details. Please try again.';
        this.loading = false;
        console.error(err);
      }
    },
    
    initializeMap() {
      // Check if map container exists
      if (!document.getElementById('map')) return;
      
      // Initialize Leaflet map
      this.map = L.map('map').setView(this.request.coordinates, 13);
      
      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
      
      // Add marker for pickup location
      this.marker = L.marker(this.request.coordinates).addTo(this.map);
      this.marker.bindPopup(this.request.location).openPopup();
    },
    
    formatDate(date) {
      if (!date) return '';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    
    async updateStatus(newStatus) {
      this.actionLoading = true;
      
      try {
        // In a real app, call API
        // await this.$api.wasteRequests.updateStatus(this.request.id, newStatus);
        
        // For demo, simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.request.status = newStatus;
      } catch (err) {
        this.error = `Failed to update status to ${newStatus}. Please try again.`;
        console.error(err);
      } finally {
        this.actionLoading = false;
      }
    }
  },
  mounted() {
    this.fetchRequestDetails();
  },
  beforeUnmount() {
    // Clean up map instance when component is destroyed
    if (this.map) {
      this.map.remove();
    }
  }
}
</script>

<style scoped>
.waste-request-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #f44336;
}

.request-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.header h1 {
  margin: 0;
  font-size: 1.8rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.pending {
  background-color: #ffeb3b;
  color: #333;
}

.approved {
  background-color: #4caf50;
  color: white;
}

.rejected {
  background-color: #f44336;
  color: white;
}

.completed {
  background-color: #2196f3;
  color: white;
}

.request-info {
  padding: 1.5rem;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.4rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.map-container {
  height: 300px;
  margin-top: 1rem;
  border-radius: 4px;
  overflow: hidden;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.approve-btn {
  background-color: #4caf50;
  color: white;
}

.approve-btn:hover:not(:disabled) {
  background-color: #388e3c;
}

.reject-btn {
  background-color: #f44336;
  color: white;
}

.reject-btn:hover:not(:disabled) {
  background-color: #d32f2f;
}

.complete-btn {
  background-color: #2196f3;
  color: white;
}

.complete-btn:hover:not(:disabled) {
  background-color: #1976d2;
}

/* For mobile responsiveness */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .status-badge {
    margin-top: 0.5rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}

/* Override for deep selector warning */
:deep(.leaflet-container) {
  z-index: 1;
}
</style>
