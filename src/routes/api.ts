import { Router } from 'express';
import { getStatus, getLookup, getLeaderboard, getBanner } from '../controllers/apiController';

const router = Router();

router.get('/status', getStatus);
router.get('/lookup', getLookup);
router.get('/leaderboard', getLeaderboard);
router.get('/banner', getBanner);

export default router;
