import { Injectable } from '@nestjs/common';
// import { UUID } from 'crypto';
import db from 'src/config/database.config';

@Injectable()
export class BaseService<T> {
    constructor(private tableName: string) {}

    async create(data: Partial<T>): Promise<T> {
        return (await db(this.tableName).insert(data).returning('*'))[0];
    }

    async findByQuery(query: object): Promise<T[]> {
        return await db(this.tableName).where(query);
    }

    async findByQueryOne(query: object): Promise<T | null> {
        return await db(this.tableName).where(query).first();
    }

    async findById(id: number): Promise<T | null> {
        return await db(this.tableName).where({ id: id }).first();
    }

    async update(id: number, data: Partial<T>): Promise<number> {
        return await db(this.tableName).where({ id }).update(data);
    }

    async delete(id: number): Promise<number> {
        return await db(this.tableName).where({ id }).del();
    }
}
