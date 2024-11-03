import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { graphql } from 'graphql';
import { gqlSchema as schema } from './gql-schema.js';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const root = {
    users: async () => {
      return await prisma.user.findMany();
    },
    posts: async () => {
      return await prisma.post.findMany();
    },
    memberTypes: async () => {
      return await prisma.memberType.findMany();
    },
    profiles: async () => {
      return await prisma.profile.findMany();
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
