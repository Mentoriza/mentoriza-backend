/* eslint-disable @typescript-eslint/no-unused-vars */

import { Prisma, PrismaClient } from '@prisma/client';

export function softDeleteExtension(prisma: PrismaClient) {
  return Prisma.defineExtension({
    name: 'softDelete',

    query: {
      $allModels: {
        async delete({ model, operation, args, query }) {
          const modelsWithSoftDelete = [
            'Student',
            'Advisor',
            'Coordinator',
            'Group',
            'Report',
          ];

          if (modelsWithSoftDelete.includes(model)) {
            return prisma[model.toLowerCase()].update({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }

          return query(args);
        },

        async deleteMany({ model, operation, args, query }) {
          const modelsWithSoftDelete = [
            'Student',
            'Advisor',
            'Coordinator',
            'Group',
            'Report',
          ];

          if (modelsWithSoftDelete.includes(model)) {
            return prisma[model.toLowerCase()].updateMany({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }

          return query(args);
        },

        async findUnique({ model, operation, args, query }) {
          if (args.where) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
          }
          return query(args);
        },

        async findFirst({ model, operation, args, query }) {
          args.where = {
            ...(args.where || {}),
            deletedAt: null,
          };
          return query(args);
        },

        async findMany({ model, operation, args, query }) {
          args.where = {
            ...(args.where || {}),
            deletedAt: null,
          };
          return query(args);
        },

        async count({ model, operation, args, query }) {
          args.where = {
            ...(args.where || {}),
            deletedAt: null,
          };
          return query(args);
        },
      },
    },
  });
}
