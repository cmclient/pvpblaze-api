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
}

interface User {
    id: number;
    nickname: string;
    points: number;
    kills: number;
    deaths: number;
    assists: number;
    position: number;
    role: string;
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

const cache = new Map<string, User>();

const calculateKDA = (kills: number, deaths: number, assists: number): string => {
    return deaths === 0 ? 'NaN' : ((kills + assists) / deaths).toFixed(2);
};

export const loadCache = (): void => {
    con.query<RawUser[]>(
        `SELECT u.name AS nickname, u.points, u.kills, u.deaths, u.assists, 
                g.name AS guild_name, g.tag AS guild_tag, g.owner AS guild_owner 
         FROM users u 
         LEFT JOIN guilds g ON FIND_IN_SET(u.name, g.members) 
         ORDER BY u.points DESC`,
        (err, result) => {
            if (err) {
                console.error(err);
            } else if (result.length === 0) {
                console.warn('Can\'t load data from database.');
            } else {
                cache.clear();
                result.forEach((element, index) => {
                    const user: User = {
                        id: index,
                        nickname: element.nickname,
                        points: element.points,
                        kills: element.kills,
                        deaths: element.deaths,
                        assists: element.assists,
                        position: index + 1,
                        role: "Player",
                        kdr: calculateKDA(element.kills, element.deaths, element.assists),
                        guild: {
                            name: element.guild_name,
                            tag: element.guild_tag,
                            owner: element.guild_owner
                        }
                    };
                    cache.set(user.nickname, user);
                });
            }
        }
    );
};

export default cache;
