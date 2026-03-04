import Notice from '../models/Notice';

export const getNotices = async (req: any, res: any) => {
    try {
        const notices = await Notice.find().populate('created_by', 'name').sort({ createdAt: -1 }).lean();
        const mapped = notices.map(n => ({
            ...n,
            author_name: (n.created_by as any)?.name || 'Admin',
            engagement_rate: Math.min(100, (n.read_receipts?.length || 0) * 10),
            id: n._id
        }));
        res.json(mapped);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const createNotice = async (req: any, res: any) => {
    try {
        const notice = await Notice.create({ ...req.body, created_by: req.user._id });

        const io = req.app.get('io');
        if (io) {
            const target = req.body.target_audience || 'All Students';
            io.to(target).emit('new_notice', notice);
            io.emit('new_notice', notice); // Fallback emit
        }

        res.status(201).json(notice);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const markRead = async (req: any, res: any) => {
    try {
        const notice = await Notice.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { read_receipts: req.user._id } },
            { new: true }
        );

        if (notice) {
            const io = req.app.get('io');
            if (io) io.emit('notice_engagement_update', {
                noticeId: notice._id,
                engagement: Math.min(100, notice.read_receipts.length * 10)
            });
        }

        res.json(notice);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
