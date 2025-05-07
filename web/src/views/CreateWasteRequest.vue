<template>
  <div class="create-waste-request">
    <h1>Create Waste Request</h1>
    <form @submit.prevent="submitRequest">
      <div class="form-group">
        <label for="title">Request Title</label>
        <input type="text" id="title" v-model="requestData.title" required>
      </div>
      
      <div class="form-group">
        <label for="description">Description</label>
        <textarea id="description" v-model="requestData.description" rows="4" required></textarea>
      </div>
      
      <div class="form-group">
        <label for="wasteType">Waste Type</label>
        <select id="wasteType" v-model="requestData.wasteType" required>
          <option value="">Select Waste Type</option>
          <option value="organic">Organic</option>
          <option value="plastic">Plastic</option>
          <option value="paper">Paper</option>
          <option value="glass">Glass</option>
          <option value="metal">Metal</option>
          <option value="electronic">Electronic</option>
          <option value="hazardous">Hazardous</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="quantity">Quantity (kg)</label>
        <input type="number" id="quantity" v-model="requestData.quantity" min="0" step="0.01" required>
      </div>
      
      <div class="form-group">
        <label for="pickupDate">Pickup Date</label>
        <input type="date" id="pickupDate" v-model="requestData.pickupDate" required>
      </div>
      
      <div class="form-group">
        <label for="location">Pickup Location</label>
        <input type="text" id="location" v-model="requestData.location" required>
      </div>
      
      <div class="form-group">
        <label>Contact Information</label>
        <input type="text" placeholder="Contact Name" v-model="requestData.contactName" required>
        <input type="tel" placeholder="Contact Phone" v-model="requestData.contactPhone" required>
        <input type="email" placeholder="Contact Email" v-model="requestData.contactEmail" required>
      </div>
      
      <div class="form-group">
        <label>Additional Notes</label>
        <textarea v-model="requestData.notes" rows="3"></textarea>
      </div>
      
      <button type="submit" :disabled="loading">{{ loading ? 'Submitting...' : 'Submit Request' }}</button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  </div>
</template>

<script>
export default {
  name: 'CreateWasteRequest',
  data() {
    return {
      requestData: {
        title: '',
        description: '',
        wasteType: '',
        quantity: null,
        pickupDate: '',
        location: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        notes: ''
      },
      loading: false,
      error: null
    }
  },
  methods: {
    async submitRequest() {
      this.loading = true;
      this.error = null;
      
      try {
        // Add your API call to create a waste request
        // Example:
        // const response = await this.$api.wasteRequests.create(this.requestData);
        // this.$router.push(`/waste-requests/${response.id}`);
        
        // For demo purposes, simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.$router.push('/waste-requests');
      } catch (err) {
        this.error = 'Failed to create request. Please try again.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.create-waste-request {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input, select, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #ff0000;
  margin-top: 1rem;
  text-align: center;
}
</style>
