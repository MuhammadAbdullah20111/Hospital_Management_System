import prisma from '../config/prismaClient.js';

class Test {
    static async create(data) {
        return prisma.test.create({
            data,
        });
    }

    static async findAll(query = {}) {
        return prisma.test.findMany({
            where: query,
            orderBy: { name: 'asc' },
        });
    }

    static async findById(id) {
        return prisma.test.findUnique({
            where: { id },
        });
    }

    static async update(id, data) {
        return prisma.test.update({
            where: { id },
            data,
        });
    }

    static async delete(id) {
        return prisma.test.delete({
            where: { id },
        });
    }
}

export default Test;
