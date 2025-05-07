<template>
  <div class="not-found">
    <div class="container">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
      <div class="illustration">
        <div class="recycling-bin">
          <div class="bin-body"></div>
          <div class="bin-lid"></div>
          <div class="recycling-symbol">♻️</div>
        </div>
      </div>
      <p>Let's get you back on track!</p>
      <div class="actions">
        <router-link to="/" class="btn home-btn">Go to Homepage</router-link>
        <router-link to="/waste-requests" class="btn requests-btn">View Waste Requests</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  text-align: center;
}

.container {
  max-width: 600px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

p {
  font-size: 1.1rem;
  color: #5a6268;
  margin-bottom: 2rem;
}

.illustration {
  margin: 2rem 0;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.recycling-bin {
  position: relative;
  width: 100px;
  height: 120px;
}

.bin-body {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 80%;
  background-color: #4CAF50;
  border-radius: 5px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.bin-lid {
  position: absolute;
  top: 0;
  width: 120%;
  height: 20%;
  background-color: #388E3C;
  border-radius: 5px;
  left: -10%;
}

.recycling-symbol {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
}

.home-btn {
  background-color: #4CAF50;
  color: white;
}

.home-btn:hover {
  background-color: #388E3C;
}

.requests-btn {
  background-color: #2196F3;
  color: white;
}

.requests-btn:hover {
  background-color: #0b7dda;
}
</style>
