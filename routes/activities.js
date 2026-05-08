import express from 'express';
import { getActivities, getActivityById, createActivity, updateActivity, deleteActivity } from '../controllers/activities.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { handlePhotoUpload } from '../middleware/upload.js';

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get('/',    getActivities);
router.get('/:id', getActivityById);
router.post('/',   handlePhotoUpload, createActivity);
router.put('/:id', handlePhotoUpload, updateActivity);
router.delete('/:id', deleteActivity);

export default router;