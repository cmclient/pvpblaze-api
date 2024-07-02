import { Router } from 'express';
import { getStatus, getLookup, getLeaderboard } from '../controllers/apiController';

const router = Router();

router.get('/status', getStatus);
router.get('/lookup', getLookup);
router.get('/leaderboard', getLeaderboard);

export default router;
