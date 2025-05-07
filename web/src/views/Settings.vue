<template>
  <div class="settings-page">
    <h1>Account Settings</h1>
    
    <div class="settings-section">
      <h2>Profile Information</h2>
      <form @submit.prevent="updateProfile">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" v-model="profile.name" required>
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="profile.email" required>
        </div>
        
        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input type="tel" id="phone" v-model="profile.phone">
        </div>
        
        <div class="form-group">
          <label for="company">Company/Organization</label>
          <input type="text" id="company" v-model="profile.company">
        </div>
        
        <button type="submit" :disabled="profileLoading">
          {{ profileLoading ? 'Updating...' : 'Update Profile' }}
        </button>
        <p v-if="profileSuccess" class="success-message">Profile updated successfully!</p>
        <p v-if="profileError" class="error-message">{{ profileError }}</p>
      </form>
    </div>
    
    <div class="settings-section">
      <h2>Change Password</h2>
      <form @submit.prevent="changePassword">
        <div class="form-group">
          <label for="currentPassword">Current Password</label>
          <input type="password" id="currentPassword" v-model="passwordData.currentPassword" required>
        </div>
        
        <div class="form-group">
          <label for="newPassword">New Password</label>
          <input type="password" id="newPassword" v-model="passwordData.newPassword" required>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Confirm New Password</label>
          <input type="password" id="confirmPassword" v-model="passwordData.confirmPassword" required>
        </div>
        
        <button type="submit" :disabled="passwordLoading">
          {{ passwordLoading ? 'Updating...' : 'Change Password' }}
        </button>
        <p v-if="passwordSuccess" class="success-message">Password updated successfully!</p>
        <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
      </form>
    </div>
    
    <div class="settings-section">
      <h2>Notification Preferences</h2>
      <div class="notification-option">
        <label>
          <input type="checkbox" v-model="notifications.email">
          Email Notifications
        </label>
      </div>
      
      <div class="notification-option">
        <label>
          <input type="checkbox" v-model="notifications.sms">
          SMS Notifications
        </label>
      </div>
      
      <div class="notification-option">
        <label>
          <input type="checkbox" v-model="notifications.pushNotifications">
          Push Notifications
        </label>
      </div>
      
      <button @click="updateNotifications" :disabled="notificationLoading">
        {{ notificationLoading ? 'Updating...' : 'Update Notifications' }}
      </button>
      <p v-if="notificationSuccess" class="success-message">Notification preferences updated!</p>
      <p v-if="notificationError" class="error-message">{{ notificationError }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      profile: {
        name: '',
        email: '',
        phone: '',
        company: ''
      },
      profileLoading: false,
      profileSuccess: false,
      profileError: null,
      
      passwordData: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordLoading: false,
      passwordSuccess: false,
      passwordError: null,
      
      notifications: {
        email: true,
        sms: false,
        pushNotifications: true
      },
      notificationLoading: false,
      notificationSuccess: false,
      notificationError: null
    }
  },
  methods: {
    async updateProfile() {
      this.profileLoading = true;
      this.profileSuccess = false;
      this.profileError = null;
      
      try {
        // Add your API call to update the profile
        // Example:
        // await this.$api.users.updateProfile(this.profile);
        
        // For demo purposes, simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.profileSuccess = true;
      } catch (err) {
        this.profileError = 'Failed to update profile. Please try again.';
        console.error(err);
      } finally {
        this.profileLoading = false;
      }
    },
    
    async changePassword() {
      if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
        this.passwordError = 'New passwords do not match';
        return;
      }
      
      this.passwordLoading = true;
      this.passwordSuccess = false;
      this.passwordError = null;
      
      try {
        // Add your API call to change the password
        // Example:
        // await this.$api.users.changePassword(this.passwordData);
        
        // For demo purposes, simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.passwordSuccess = true;
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      } catch (err) {
        this.passwordError = 'Failed to change password. Please try again.';
        console.error(err);
      } finally {
        this.passwordLoading = false;
      }
    },
    
    async updateNotifications() {
      this.notificationLoading = true;
      this.notificationSuccess = false;
      this.notificationError = null;
      
      try {
        // Add your API call to update notification preferences
        // Example:
        // await this.$api.users.updateNotifications(this.notifications);
        
        // For demo purposes, simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.notificationSuccess = true;
      } catch (err) {
        this.notificationError = 'Failed to update notification preferences. Please try again.';
        console.error(err);
      } finally {
        this.notificationLoading = false;
      }
    }
  },
  mounted() {
    // Fetch user data when the component mounts
    // Example:
    // this.$api.users.getProfile().then(data => {
    //   this.profile = data;
    // });
    
    // For demo purposes, set some mock data
    this.profile = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      company: 'Acme Corp'
    };
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  text-align: center;
}

.settings-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.notification-option label {
  display: flex;
  align-items: center;
  font-weight: normal;
  margin-bottom: 1rem;
}

.notification-option input {
  margin-right: 0.5rem;
  width: auto;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.success-message {
  color: #4CAF50;
  margin-top: 1rem;
}

.error-message {
  color: #ff0000;
  margin-top: 1rem;
}
</style>
