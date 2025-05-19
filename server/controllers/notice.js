const Notice = require('../models/Notice');

// 모든 공지사항 조회
exports.getAllNotices = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const query = { isPublished: true };

    // 사용자 역할에 따른 필터링
    if (req.user.role !== 'platform_admin') {
      query.targetRoles = req.user.role;
    }

    if (type) query.type = type;

    const notices = await Notice.find(query)
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Notice.countDocuments(query);

    res.json({
      notices,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: '공지사항 목록 조회 중 오류가 발생했습니다.' });
  }
};

// 단일 공지사항 조회
exports.getNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('author', 'name');

    if (!notice) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (notice.isPublished === false && req.user.role !== 'platform_admin') {
      return res.status(403).json({ message: '이 공지사항에 접근할 권한이 없습니다.' });
    }

    if (req.user.role !== 'platform_admin' && !notice.targetRoles.includes(req.user.role)) {
      return res.status(403).json({ message: '이 공지사항에 접근할 권한이 없습니다.' });
    }

    // 조회수 증가
    notice.views += 1;
    await notice.save();

    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: '공지사항 조회 중 오류가 발생했습니다.' });
  }
};

// 공지사항 생성 (관리자용)
exports.createNotice = async (req, res) => {
  try {
    const {
      title,
      content,
      type,
      targetRoles,
      attachments,
      isPublished
    } = req.body;

    const notice = new Notice({
      title,
      content,
      author: req.user._id,
      type,
      targetRoles,
      attachments,
      isPublished,
      publishedAt: isPublished ? new Date() : null
    });

    await notice.save();

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: '공지사항 생성 중 오류가 발생했습니다.' });
  }
};

// 공지사항 수정 (관리자용)
exports.updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }

    const {
      title,
      content,
      type,
      targetRoles,
      attachments,
      isPublished
    } = req.body;

    const updateData = {
      title,
      content,
      type,
      targetRoles,
      attachments
    };

    // 발행 상태가 변경된 경우
    if (isPublished !== notice.isPublished) {
      updateData.isPublished = isPublished;
      updateData.publishedAt = isPublished ? new Date() : null;
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate('author', 'name');

    res.json(updatedNotice);
  } catch (error) {
    res.status(500).json({ message: '공지사항 수정 중 오류가 발생했습니다.' });
  }
};

// 공지사항 삭제 (관리자용)
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }

    await notice.remove();
    res.json({ message: '공지사항이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '공지사항 삭제 중 오류가 발생했습니다.' });
  }
};

// 공지사항 발행 (관리자용)
exports.publishNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }

    if (notice.isPublished) {
      return res.status(400).json({ message: '이미 발행된 공지사항입니다.' });
    }

    notice.isPublished = true;
    notice.publishedAt = new Date();
    await notice.save();

    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: '공지사항 발행 중 오류가 발생했습니다.' });
  }
};

// 공지사항 발행 취소 (관리자용)
exports.unpublishNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }

    if (!notice.isPublished) {
      return res.status(400).json({ message: '아직 발행되지 않은 공지사항입니다.' });
    }

    notice.isPublished = false;
    notice.publishedAt = null;
    await notice.save();

    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: '공지사항 발행 취소 중 오류가 발생했습니다.' });
  }
}; 