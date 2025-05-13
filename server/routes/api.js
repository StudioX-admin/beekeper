// server/routes/api.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const wasteRequestController = require('../controllers/wasteRequestController');
const vehicleController = require('../controllers/vehicleController');
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

// 인증 라우트
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.post('/auth/refresh-token', authController.refreshToken);

// 사용자 관리 라우트
router.get('/users', authenticate, authorize(['admin']), userController.getAllUsers);
router.get('/users/:id', authenticate, userController.getUserById);
router.post('/users', authenticate, authorize(['admin']), userController.createUser);
router.put('/users/:id', authenticate, userController.updateUser);
router.delete('/users/:id', authenticate, authorize(['admin']), userController.deleteUser);

// 기사 전용 라우트
router.get('/driver/profile', authenticate, authorize(['driver']), userController.getDriverProfile);
router.put('/driver/profile', authenticate, authorize(['driver']), userController.updateDriverProfile);

// 폐기물 요청 라우트
router.get('/waste-requests', authenticate, wasteRequestController.getAllWasteRequests);
router.get('/waste-requests/:id', authenticate, wasteRequestController.getWasteRequestById);
router.post('/waste-requests', authenticate, authorize(['admin']), wasteRequestController.createWasteRequest);
router.put('/waste-requests/:id', authenticate, wasteRequestController.updateWasteRequest);
router.delete('/waste-requests/:id', authenticate, authorize(['admin']), wasteRequestController.deleteWasteRequest);

// 기사 작업 관련 라우트
router.get('/driver/tasks', authenticate, authorize(['driver']), wasteRequestController.getDriverTasks);
router.put('/driver/tasks/:id/start', authenticate, authorize(['driver']), wasteRequestController.startTask);
router.put('/driver/tasks/:id/complete', authenticate, authorize(['driver']), wasteRequestController.completeTask);
router.post('/driver/tasks/:id/photos', authenticate, authorize(['driver']), wasteRequestController.uploadTaskPhotos);

// 차량 관리 라우트
router.get('/vehicles', authenticate, vehicleController.getAllVehicles);
router.get('/vehicles/:id', authenticate, vehicleController.getVehicleById);
router.post('/vehicles', authenticate, authorize(['admin']), vehicleController.createVehicle);
router.put('/vehicles/:id', authenticate, authorize(['admin']), vehicleController.updateVehicle);
router.delete('/vehicles/:id', authenticate, authorize(['admin']), vehicleController.deleteVehicle);
router.put('/vehicles/:id/assign', authenticate, authorize(['admin']), vehicleController.assignVehicle);
router.put('/vehicles/:id/maintenance', authenticate, authorize(['admin']), vehicleController.setVehicleMaintenance);

// 보고서 라우트
router.get('/reports/summary', authenticate, authorize(['admin']), reportController.getSummaryReport);
router.get('/reports/waste-by-type', authenticate, authorize(['admin']), reportController.getWasteByTypeReport);
router.get('/reports/driver-performance', authenticate, authorize(['admin']), reportController.getDriverPerformanceReport);
router.get('/reports/export', authenticate, authorize(['admin']), reportController.exportReport);

module.exports = router;
