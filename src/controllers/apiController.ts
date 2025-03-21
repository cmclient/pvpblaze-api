import { Request, Response } from 'express';
import cache from '../utils/cache';
import { createCanvas, loadImage } from 'canvas';

export const getStatus = async (req: Request, res: Response) => {
    res.status(200).json({ status: "online" });
};

export const getLookup = async (req: Request, res: Response) => {
    const player = req.query.name as string;
    if (!player) {
        res.status(400).json({ status: "error", message: "Name parameter is not set." });
        return;
    }

    const cached = cache.find(user => user.nickname === player);
    if (!cached) {
        res.status(200).json({});
    } else {
        res.status(200).json(cached);
    }
};

export const getLeaderboard = async (req: Request, res: Response) => {
    res.status(200).json(cache);
};

export const getBanner = async (req: Request, res: Response) => {
    try {
        const { type, userName, avatarUrl } = req.query;

        if (!type || !userName || !avatarUrl) {
            return res.status(400).json({ status: "error", message: "Type, userName, and avatarUrl parameters are required." });
        }

        const canvas = createCanvas(800, 200);
        const ctx = canvas.getContext('2d');

        const background = await loadImage('https://cdn.cmclient.pl/images/discord-green-banner.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const avatar = await loadImage(avatarUrl as string);
        const avatarSize = 100;
        const borderSize = 2;
        const centerX = (canvas.width - avatarSize) / 2;
        const centerY = 30;

        // Draw rounded border
        ctx.beginPath();
        ctx.arc(centerX + avatarSize / 2, centerY + avatarSize / 2, (avatarSize / 2) + borderSize, 0, Math.PI * 2, true);
        ctx.fillStyle = 'white';
        ctx.fill();

        // Draw rounded avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX + avatarSize / 2, centerY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true); // Circle for rounded avatar
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, centerX, centerY, avatarSize, avatarSize);
        ctx.restore();

        ctx.font = 'bold 30px "Poppins"';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 15;
        ctx.fillText(`${userName} has ${type === 'join' ? 'joined' : 'left'}`, canvas.width / 2, centerY + avatarSize + 30)

        const buffer = canvas.toBuffer('image/png');

        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
};
