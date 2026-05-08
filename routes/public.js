import express from 'express';
import { getActivities, getActivityById, getTypes, getObjectives } from '../controllers/public.js';

const router = express.Router();

router.get('/activities', getActivities);
router.get('/types', getTypes);
router.get('/objectives', getObjectives);
router.get('/activities/:id', getActivityById);

export default router;
