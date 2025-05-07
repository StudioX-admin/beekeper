<template>
  <div class="dashboard">
    <h1>Smart Waste Management Dashboard</h1>
    
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <h3>Total Requests</h3>
          <p class="stat-value">{{ stats.totalRequests }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <h3>Pending</h3>
          <p class="stat-value">{{ stats.pendingRequests }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <h3>Completed</h3>
          <p class="stat-value">{{ stats.completedRequests }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">♻️</div>
        <div class="stat-info">
          <h3>Total Waste Recycled</h3>
          <p class="stat-value">{{ stats.totalWasteRecycled }} kg</p>
        </div>
      </div>
    </div>
    
    <div class="actions">
      <router-link to="/create-waste-request" class="action-btn">
        New Waste Request
      </router-link>
    </div>
    
    <div class="requests-section">
      <h2>Recent Waste Requests</h2>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="wasteRequests.length === 0" class="no-requests">
        No waste requests found. Create your first request!
      </div>
      <table v-else class="requests-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Waste Type</th>
            <th>Quantity</th>
            <th>Pickup Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in wasteRequests" :key="request.id">
            <td>{{ request.id }}</td>
            <td>{{ request.title }}</td>
            <td>{{ request.wasteType }}</td>
            <td>{{ request.quantity }} kg</td>
            <td>{{ formatDate(request.pickupDate) }}</td>
            <td>
              <span class="status-badge" :class="request.status.toLowerCase()">
                {{ request.status }}
              </span>
            </td>
            <td>
              <router-link :to="`/waste-requests/${request.id}`" class="view-btn">
                View
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      stats: {
        totalRequests: 0,
        pendingRequests: 0,
        completedRequests: 0,
        totalWasteRecycled: 0
      },
      wasteRequests: [],
      loading: true,
      error: null
    };
  },
  methods: {
    async fetchDashboardData() {
      try {
        this.loading = true;
        
        // For demo purposes, using mock data
        // In a real application, you would fetch from an API
        // const response = await this.$api.dashboard.getStats();
        // const requestsResponse = await this.$api.wasteRequests.getRecent();
        
        // Mock data for demo
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.stats = {
          totalRequests: 24,
          pendingRequests: 5,
          completedRequests: 18,
          totalWasteRecycled: 1250
        };
        
        this.wasteRequests = [
          {
            id: 'WR-2024-001',
            title: 'Plastic Waste Collection',
            wasteType: 'Plastic',
            quantity: 50,
            pickupDate: new Date('2024-05-15'),
            status: 'Pending'
          },
          {
            id: 'WR-2024-002',
            title: 'Paper Recycling',
            wasteType: 'Paper',
            quantity: 75,
            pickupDate: new Date('2024-05-10'),
            status: 'Approved'
          },
          {
            id: 'WR-2024-003',
            title: 'Electronic Waste',
            wasteType: 'Electronic',
            quantity: 30,
            pickupDate: new Date('2024-05-05'),
            status: 'Completed'
          },
          {
            id: 'WR-2024-004',
            title: 'Glass Bottles',
            wasteType: 'Glass',
            quantity: 45,
            pickupDate: new Date('2024-05-02'),
            status: 'Completed'
          },
          {
            id: 'WR-2024-005',
            title: 'Metal Scraps',
            wasteType: 'Metal',
            quantity: 100,
            pickupDate: new Date('2024-04-28'),
            status: 'Rejected'
          }
        ];
        
        this.loading = false;
      } catch (err) {
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
        console.error(err);
      }
    },
    
    formatDate(date) {
      if (!date) return '';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    }
  },
  mounted() {
    this.fetchDashboardData();
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  text-align: center;
  color: #2c3e50;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 1rem;
}

.stat-info h3 {
  margin: 0;
  font-size: 1rem;
  color: #6c757d;
}

.stat-value {
  margin: 0.5rem 0 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
}

.actions {
  margin-bottom: 2rem;
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  display: inline-block;
  background-color: #4CAF50;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
}

.action-btn:hover {
  background-color: #388E3C;
}

.requests-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #2c3e50;
}

.loading, .error, .no-requests {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #f44336;
}

.requests-table {
  width: 100%;
  border-collapse: collapse;
}

.requests-table th, .requests-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.requests-table th {
  font-weight: bold;
  color: #6c757d;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
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

.view-btn {
  display: inline-block;
  background-color: #2196f3;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.8rem;
  transition: background-color 0.3s;
}

.view-btn:hover {
  background-color: #0b7dda;
}

/* For mobile responsiveness */
@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .requests-table {
    display: block;
    overflow-x: auto;
  }
  
  .actions {
    justify-content: center;
  }
}
</style>
