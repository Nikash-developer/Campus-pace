import Submission from '../models/Submission';

export const getSubmissionsByAssignment = async (req: any, res: any) => {
    try {
        const { assignmentId } = req.params;
        const submissions = await Submission.find({ assignment_id: assignmentId }).populate('student_id', 'name email roll_no');
        res.status(200).json(submissions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const downloadSubmission = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const submission = await Submission.findById(id);

        if (!submission || !submission.file_data) {
            return res.status(404).json({ error: 'Submission or file not found' });
        }

        // Set the correct response headers for the file
        res.set({
            'Content-Type': submission.content_type || 'application/pdf',
            'Content-Disposition': `attachment; filename="submission_${id}.pdf"`,
            'Content-Length': submission.file_data.length
        });

        res.send(submission.file_data);
    } catch (error: any) {
        console.error('Download Error:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
};
