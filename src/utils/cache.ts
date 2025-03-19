import mysql, { RowDataPacket } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

interface RawUser extends RowDataPacket {
    nickname: string;
    points: number;
    kills: number;
    deaths: number;
    assists: number;
    guild_name: string;
    guild_tag: string;
    guild_owner: string;
    primary_group?: string;
}

interface User {
    id: number;
    position: number;
    nickname: string;
    points: number;
    kills: number;
    deaths: number;
    assists: number;
    role: string;
    group: 'Members' | 'Staff';
    kdr: string;
    guild: {
        name: string;
        tag: string;
        owner: string;
    };
}

const con = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_BASE
});

const cache: User[] = [];

const roleMap: Record<string, string> = {
    owner: 'Owner',
    vowner: 'vOwner',
    headadmin: 'HeadAdmin',
    chatmod: 'ChatMod',
    media: 'Media',
    sigma: 'Sigma',
    sponsor: 'Sponsor',
    svip: 'SVIP',
    vip: 'VIP',
    default: 'Player'
};

const staffRoles = ["owner", "vowner", "headadmin", "admin", "moderator", "support", "chatmod"];

const formatRole = (role: string): string => {
    return roleMap[role.toLowerCase()] || (role.charAt(0).toUpperCase() + role.slice(1));
};

const calculateKDA = (kills: number, deaths: number, assists: number): string => {
    return deaths === 0 ? 'NaN' : ((kills + assists) / deaths).toFixed(2);
};

export const loadCache = (): void => {
    con.query<RawUser[]>(`
        SELECT 
            u.name AS nickname, 
            u.points, 
            u.kills, 
            u.deaths, 
            u.assists, 
            g.name AS guild_name, 
            g.tag AS guild_tag, 
            g.owner AS guild_owner, 
            lp.primary_group 
        FROM 
            users u
        LEFT JOIN 
            guilds g ON FIND_IN_SET(u.name, g.members)
        LEFT JOIN 
            luckperms_players lp ON lp.username = u.name
        ORDER BY 
            u.points DESC;
    `, (err, result) => {
        if (err) {
            console.error(err);
        } else if (result.length === 0) {
            console.warn('Can\'t load data from database.');
        } else {
            cache.length = 0;

            const users: User[] = result.map((element, index) => {
                const formattedRole = element.primary_group ? formatRole(element.primary_group) : "Player";

                const user: User = {
                    id: index,
                    position: 0,
                    nickname: element.nickname,
                    points: element.points,
                    kills: element.kills,
                    deaths: element.deaths,
                    assists: element.assists,
                    role: formattedRole,
                    group: element.primary_group && staffRoles.includes(element.primary_group.toLowerCase()) ? 'Staff' : 'Members',
                    kdr: calculateKDA(element.kills, element.deaths, element.assists),
                    guild: {
                        name: element.guild_name,
                        tag: element.guild_tag,
                        owner: element.guild_owner
                    }
                };
                return user;
            });

            users.sort((a, b) => b.points - a.points);

            const uniqueUsers = users.filter((user, index, self) =>
                index === self.findIndex((u) => u.nickname === user.nickname)
            );

            uniqueUsers.forEach((user, index) => {
                user.position = index + 1;
            });

            cache.push(...uniqueUsers);
        }
    });
};

export default cache;
