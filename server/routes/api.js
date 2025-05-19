// server/routes/api.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const adminAuth = require('../middlewares/adminAuth');
const driverAuth = require('../middlewares/driverAuth');
const upload = require('../middlewares/upload');

// 컨트롤러 임포트
const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const vehicleController = require('../controllers/vehicle');
const wasteRequestController = require('../controllers/wasteRequest');
const adminController = require('../controllers/admin');
const reservationController = require('../controllers/reservation');
const noticeController = require('../controllers/notice');
const inquiryController = require('../controllers/inquiry');

// 인증 라우트
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.post('/auth/logout', auth, authController.logout);
router.get('/auth/me', auth, authController.getMe);

// 사용자 관리 라우트
router.get('/users', auth, adminAuth, userController.getAllUsers);
router.get('/users/:id', auth, userController.getUser);
router.post('/users', auth, adminAuth, userController.createUser);
router.put('/users/:id', auth, userController.updateUser);
router.delete('/users/:id', auth, adminAuth, userController.deleteUser);
router.post('/users/:id/change-password', auth, userController.changePassword);
router.get('/drivers', auth, userController.getDrivers);

// 차량 관리 라우트
router.get('/vehicles', auth, vehicleController.getAllVehicles);
router.get('/vehicles/:id', auth, vehicleController.getVehicle);
router.post('/vehicles', auth, adminAuth, vehicleController.createVehicle);
router.put('/vehicles/:id', auth, adminAuth, vehicleController.updateVehicle);
router.delete('/vehicles/:id', auth, adminAuth, vehicleController.deleteVehicle);
router.post('/vehicles/:id/assign-driver', auth, adminAuth, vehicleController.assignDriver);
router.post('/vehicles/:id/unassign-driver', auth, adminAuth, vehicleController.unassignDriver);

// 폐기물 수거 요청 라우트
router.get('/waste-requests', auth, wasteRequestController.getAllRequests);
router.get('/waste-requests/:id', auth, wasteRequestController.getRequest);
router.post('/waste-requests', auth, upload.single('image'), wasteRequestController.createRequest);
router.put('/waste-requests/:id', auth, upload.single('image'), wasteRequestController.updateRequest);
router.delete('/waste-requests/:id', auth, wasteRequestController.deleteRequest);

// 기사 전용 라우트
router.get('/driver/requests', auth, driverAuth, wasteRequestController.getDriverRequests);
router.put('/driver/requests/:id/status', auth, driverAuth, wasteRequestController.updateRequestStatus);

// 관리자 전용 라우트
router.get('/admin/dashboard', auth, adminAuth, adminController.getDashboardStats);
router.get('/admin/requests', auth, adminAuth, adminController.getRequests);
router.get('/admin/vehicles', auth, adminAuth, adminController.getVehicles);
router.get('/admin/drivers', auth, adminAuth, adminController.getDrivers);
router.get('/admin/reports', auth, adminAuth, adminController.generateReport);
router.post('/admin/requests/:id/assign', auth, adminAuth, wasteRequestController.assignRequest);

// 폐기물 처리 예약 라우트
router.get('/reservations', adminAuth, reservationController.getAllReservations);
router.get('/reservations/:id', auth, reservationController.getReservation);
router.post('/reservations', auth, reservationController.createReservation);
router.put('/reservations/:id', auth, reservationController.updateReservation);
router.delete('/reservations/:id', auth, reservationController.deleteReservation);
router.put('/reservations/:id/status', auth, reservationController.updateReservationStatus);

// 운반업체 예약 라우트
router.get('/transporter/reservations', auth, reservationController.getTransporterReservations);

// 처리업체 예약 라우트
router.get('/processor/reservations', auth, reservationController.getProcessorReservations);

// 공지사항 라우트
router.get('/notices', auth, noticeController.getAllNotices);
router.get('/notices/:id', auth, noticeController.getNotice);
router.post('/notices', auth, noticeController.createNotice);
router.put('/notices/:id', auth, noticeController.updateNotice);
router.delete('/notices/:id', auth, noticeController.deleteNotice);
router.post('/notices/:id/publish', auth, noticeController.publishNotice);
router.post('/notices/:id/unpublish', auth, noticeController.unpublishNotice);

// 1:1 문의 라우트
router.get('/inquiries', auth, inquiryController.getAllInquiries);
router.get('/inquiries/user', auth, inquiryController.getUserInquiries);
router.get('/inquiries/:id', auth, inquiryController.getInquiry);
router.post('/inquiries', auth, inquiryController.createInquiry);
router.put('/inquiries/:id', auth, inquiryController.updateInquiry);
router.delete('/inquiries/:id', auth, inquiryController.deleteInquiry);
router.post('/inquiries/:id/response', auth, inquiryController.addResponse);
router.put('/inquiries/:id/status', auth, inquiryController.updateInquiryStatus);
router.put('/inquiries/:id/assign', auth, inquiryController.assignInquiry);

module.exports = router;
