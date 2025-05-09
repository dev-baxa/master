import { Injectable, NotFoundException } from '@nestjs/common';
import db from 'src/config/database.config';

import { MasterInterface, UserInterface } from '../auth/entity/user-interface';

@Injectable()
export class UserService {
    async getAllMastersByCategoryId(
        categoryId: string,
    ): Promise<{ data: Partial<UserInterface & MasterInterface>[] }> {
        const category = await db('categories').where('id', categoryId).first();

        if (!category) throw new NotFoundException('Category not found');
        const result = await db('masters')
            .select(
                'users.id as id',
                'users.firstname',
                'users.lastname',
                'users.phone',
                'masters.experience',
                'masters.rating_avg',
                'masters.category_id',
                'users.avatar',
            )
            .whereRaw('? = ANY(category_id)', [categoryId])
            .join('users', 'masters.user_id', '=', 'users.id');

        return {
            data: result,
        };
    }

    async getAllMasters(): Promise<{
        data: Partial<UserInterface & MasterInterface>[];
    }> {
        const result = await db('masters')
            .select(
                'users.id as id',
                'users.firstname',
                'users.lastname',
                'users.phone',
                'masters.experience',
                'masters.rating_avg',
                'masters.category_id',
                'users.avatar',
                'masters.is_premium',
                'masters.premium_until',
            )
            .whereNotNull('masters.experience')
            .join('users', 'masters.user_id', '=', 'users.id')
            .orderByRaw(`CASE 
                             WHEN masters.is_premium = true AND masters.premium_until > NOW() THEN 0
                             ELSE 1
                        END,    
                            masters.id DESC`);

        return {
            data: result,
        };
    }

    async getMasterById(
        id: string,
    ): Promise<Partial<UserInterface & MasterInterface>> {
        const result = await db('masters')
            .select(
                'users.id as id',
                'users.firstname',
                'users.lastname',
                'users.phone',
                'masters.experience',
                'masters.rating_avg',
                'masters.category_id',
                'users.avatar',
            )
            .where('users.id', id)
            .whereNotNull('masters.experience')
            .join('users', 'masters.user_id', '=', 'users.id')
            .first();

        if (!result) throw new NotFoundException('Master not found');

        return result;
    }

    async findNearest(
        lat: number,
        lng: number,
    ): Promise<{ data: Partial<UserInterface & MasterInterface>[] }> {
        const result = await db('masters')
            .select(
                '*',
                db.raw(
                    `
      6371 * acos(
        cos(radians(?)) * cos(radians(CAST(latitude AS FLOAT))) * 
        cos(radians(CAST(longitude AS FLOAT)) - radians(?)) + 
        sin(radians(?)) * sin(radians(CAST(latitude AS FLOAT)))
      ) AS distance
    `,
                    [lat, lng, lat],
                ),
            )
            .orderBy('distance');

        return { data: result };
    }
}
