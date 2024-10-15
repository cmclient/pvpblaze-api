import { Request, Response } from 'express';
import cache from '../utils/cache';
import { createCanvas, loadImage } from 'canvas'; // You'll need to install canvas

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

export const getBanner = async (req: Request, res: Response) => {
    const { type, userName, avatarUrl } = req.query;

    if (!type || !userName || !avatarUrl) {
        return res.status(400).json({ status: "error", message: "Type, userName, and avatarUrl parameters are required." });
    }

    const canvas = createCanvas(800, 200);
    const ctx = canvas.getContext('2d');

    const background = await loadImage('https://i.imgur.com/0S3e1RF.png');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const avatar = await loadImage(avatarUrl as string);
    const avatarSize = 100;
    const borderSize = 3;
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

    // Set font and shadow for text
    ctx.font = 'bold 30px "Poppins"';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText(`${userName} has ${type === 'join' ? 'joined' : 'left'}`, canvas.width / 2, centerY + avatarSize + 30); // Centered below avatar

    const buffer = canvas.toBuffer('image/png');
    
    res.set('Content-Type', 'image/png');
    res.send(buffer);
};
