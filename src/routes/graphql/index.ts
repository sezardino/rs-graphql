import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { graphql } from 'graphql';
import { gqlSchema as schema } from './gql-schema.js';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { MemberTypeId } from '../member-types/schemas.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const root = {
    users: async () => {
      return await prisma.user.findMany({
        include: {
          posts: true,
          profile: {
            include: { memberType: true },
          },
        },
      });
    },
    user: async ({ id }: { id: string }) => {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          posts: true,
          profile: {
            include: {
              memberType: true,
            },
          },
        },
      });

      return user;
    },
    posts: async () => {
      return await prisma.post.findMany();
    },
    post: async ({ id }: { id: string }) => {
      return await prisma.post.findUnique({
        where: { id },
      });
    },
    memberTypes: async () => {
      return await prisma.memberType.findMany();
    },
    memberType: async ({ id }: { id: MemberTypeId }) => {
      return await prisma.memberType.findUnique({
        where: { id },
      });
    },
    profiles: async () => {
      return await prisma.profile.findMany();
    },
    profile: async ({ id }: { id: string }) => {
      return await prisma.profile.findUnique({
        where: { id },
      });
    },
  };

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body as {
        query: string;
        variables?: Record<string, unknown>;
      };

      try {
        const result = await graphql({
          schema,
          source: query,
          rootValue: root,
          variableValues: variables,
        });

        return result;
      } catch (error) {
        fastify.log.error(error);
        throw fastify.httpErrors.internalServerError('Failed to execute GraphQL query');
      }
    },
  });
};

export default plugin;
