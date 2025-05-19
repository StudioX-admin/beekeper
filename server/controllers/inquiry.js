const Inquiry = require('../models/Inquiry');
const User = require('../models/User');

// 모든 문의 조회 (관리자용)
exports.getAllInquiries = async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const inquiries = await Inquiry.find(query)
      .populate('user', 'name email company')
      .populate('assignedTo', 'name')
      .populate('responses.responder', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Inquiry.countDocuments(query);

    res.json({
      inquiries,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: '문의 목록 조회 중 오류가 발생했습니다.' });
  }
};

// 사용자의 문의 목록 조회
exports.getUserInquiries = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;

    const inquiries = await Inquiry.find(query)
      .populate('assignedTo', 'name')
      .populate('responses.responder', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Inquiry.countDocuments(query);

    res.json({
      inquiries,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: '문의 목록 조회 중 오류가 발생했습니다.' });
  }
};

// 단일 문의 조회
exports.getInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('user', 'name email company')
      .populate('assignedTo', 'name')
      .populate('responses.responder', 'name');

    if (!inquiry) {
      return res.status(404).json({ message: '문의를 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (req.user.role !== 'platform_admin' && req.user._id.toString() !== inquiry.user._id.toString()) {
      return res.status(403).json({ message: '이 문의에 접근할 권한이 없습니다.' });
    }

    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: '문의 조회 중 오류가 발생했습니다.' });
  }
};

// 문의 생성
exports.createInquiry = async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      priority,
      attachments
    } = req.body;

    const inquiry = new Inquiry({
      user: req.user._id,
      title,
      content,
      category,
      priority,
      attachments
    });

    await inquiry.save();

    res.status(201).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: '문의 생성 중 오류가 발생했습니다.' });
  }
};

// 문의 수정
exports.updateInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: '문의를 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (req.user._id.toString() !== inquiry.user._id.toString()) {
      return res.status(403).json({ message: '이 문의를 수정할 권한이 없습니다.' });
    }

    // 상태가 pending인 경우에만 수정 가능
    if (inquiry.status !== 'pending') {
      return res.status(400).json({ message: '이미 처리된 문의는 수정할 수 없습니다.' });
    }

    const {
      title,
      content,
      category,
      priority,
      attachments
    } = req.body;

    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title,
          content,
          category,
          priority,
          attachments
        }
      },
      { new: true }
    ).populate('user', 'name email company')
      .populate('assignedTo', 'name')
      .populate('responses.responder', 'name');

    res.json(updatedInquiry);
  } catch (error) {
    res.status(500).json({ message: '문의 수정 중 오류가 발생했습니다.' });
  }
};

// 문의 삭제
exports.deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: '문의를 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (req.user._id.toString() !== inquiry.user._id.toString()) {
      return res.status(403).json({ message: '이 문의를 삭제할 권한이 없습니다.' });
    }

    // 상태가 pending인 경우에만 삭제 가능
    if (inquiry.status !== 'pending') {
      return res.status(400).json({ message: '이미 처리된 문의는 삭제할 수 없습니다.' });
    }

    await inquiry.remove();
    res.json({ message: '문의가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '문의 삭제 중 오류가 발생했습니다.' });
  }
};

// 문의 답변 작성 (관리자용)
exports.addResponse = async (req, res) => {
  try {
    const { content, attachments } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: '문의를 찾을 수 없습니다.' });
    }

    // 상태가 completed인 경우 답변 불가
    if (inquiry.status === 'completed') {
      return res.status(400).json({ message: '이미 완료된 문의입니다.' });
    }

    const response = {
      responder: req.user._id,
      content,
      attachments,
      createdAt: new Date()
    };

    inquiry.responses.push(response);
    inquiry.status = 'in_progress';
    await inquiry.save();

    const updatedInquiry = await Inquiry.findById(req.params.id)
      .populate('user', 'name email company')
      .populate('assignedTo', 'name')
      .populate('responses.responder', 'name');

    res.json(updatedInquiry);
  } catch (error) {
    res.status(500).json({ message: '답변 작성 중 오류가 발생했습니다.' });
  }
};

// 문의 상태 업데이트 (관리자용)
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: '문의를 찾을 수 없습니다.' });
    }

    if (status === 'completed') {
      inquiry.completedAt = new Date();
    }

    inquiry.status = status;
    await inquiry.save();

    const updatedInquiry = await Inquiry.findById(req.params.id)
      .populate('user', 'name email company')
      .populate('assignedTo', 'name')
      .populate('responses.responder', 'name');

    res.json(updatedInquiry);
  } catch (error) {
    res.status(500).json({ message: '문의 상태 업데이트 중 오류가 발생했습니다.' });
  }
};

// 문의 담당자 지정 (관리자용)
exports.assignInquiry = async (req, res) => {
  try {
    const { assignedToId } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: '문의를 찾을 수 없습니다.' });
    }

    // 담당자 확인
    const assignedTo = await User.findOne({ _id: assignedToId, role: 'platform_admin' });
    if (!assignedTo) {
      return res.status(404).json({ message: '유효한 담당자를 찾을 수 없습니다.' });
    }

    inquiry.assignedTo = assignedToId;
    inquiry.status = 'in_progress';
    await inquiry.save();

    const updatedInquiry = await Inquiry.findById(req.params.id)
      .populate('user', 'name email company')
      .populate('assignedTo', 'name')
      .populate('responses.responder', 'name');

    res.json(updatedInquiry);
  } catch (error) {
    res.status(500).json({ message: '담당자 지정 중 오류가 발생했습니다.' });
  }
}; 