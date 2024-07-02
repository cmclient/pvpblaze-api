import { Request, Response } from 'express';
import cache from '../utils/cache';

export const getStatus = async (req: Request, res: Response) => {
    res.status(200).json({ status: "online" });
};

export const getLookup = async (req: Request, res: Response) => {
    const player = req.query.name as string;
    if (!player) {
        res.status(400).json({ status: "error", message: "Name parameter is not set." });
        return;
    }

    const cached = cache.get(player);
    if (!cached) {
        res.status(200).json({});
    } else {
        res.status(200).json(cached);
    }
};

export const getLeaderboard = async (req: Request, res: Response) => {
    const users = Array.from(cache.values());
    res.status(200).json(users);
};
