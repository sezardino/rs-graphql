import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { graphql } from 'graphql';
import { gqlSchema as schema } from './gql-schema.js';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { MemberTypeId } from '../member-types/schemas.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const root = {
    // queries
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
          subscribedToUser: {
            include: {
              subscriber: {
                include: {
                  subscribedToUser: {
                    include: {
                      subscriber: {
                        include: { subscribedToUser: true, userSubscribedTo: true },
                      },
                    },
                  },
                  userSubscribedTo: {
                    include: {
                      author: {
                        include: { subscribedToUser: true, userSubscribedTo: true },
                      },
                    },
                  },
                },
              },
            },
          },
          userSubscribedTo: {
            include: {
              author: {
                include: {
                  subscribedToUser: {
                    include: {
                      subscriber: {
                        include: { subscribedToUser: true, userSubscribedTo: true },
                      },
                    },
                  },
                  userSubscribedTo: {
                    include: {
                      author: {
                        include: { subscribedToUser: true, userSubscribedTo: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) return null;

      return {
        ...user,
        subscribedToUser: user?.subscribedToUser.map((sub) => ({
          ...sub.subscriber,
          subscribedToUser: sub?.subscriber.subscribedToUser.map((u) => u.subscriber),
          userSubscribedTo: sub?.subscriber.userSubscribedTo.map((u) => u.author),
        })),
        userSubscribedTo: user?.userSubscribedTo.map((sub) => ({
          ...sub.author,
          subscribedToUser: sub.author?.subscribedToUser.map((u) => u.subscriber),
          userSubscribedTo: sub.author?.userSubscribedTo.map((u) => u.author),
        })),
      };
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

    // mutations
    createPost: async ({
      dto,
    }: {
      dto: { title: string; content: string; authorId: string };
    }) => {
      return await prisma.post.create({
        data: dto,
      });
    },
    createUser: async ({
      dto,
    }: {
      dto: {
        name: string;
        balance: number;
        profile: { isMale: boolean; yearOfBirth: number; memberTypeId: string };
      };
    }) => {
      const { profile, ...userData } = dto;
      const user = await prisma.user.create({
        data: {
          ...userData,
          profile: {
            create: profile,
          },
        },
      });
      return user;
    },
    createProfile: async ({
      dto,
    }: {
      dto: { isMale: boolean; yearOfBirth: number; userId: string; memberTypeId: string };
    }) => {
      return await prisma.profile.create({
        data: dto,
      });
    },
    deletePost: async ({ id }: { id: string }) => {
      await prisma.post.delete({
        where: { id },
      });
      return true;
    },
    deleteProfile: async ({ id }: { id: string }) => {
      await prisma.profile.delete({
        where: { id },
      });
      return true;
    },
    deleteUser: async ({ id }: { id: string }) => {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    },
    changePost: async ({
      id,
      dto,
    }: {
      id: string;
      dto: { title?: string; content?: string };
    }) => {
      return await prisma.post.update({
        where: { id },
        data: dto,
      });
    },
    changeProfile: async ({
      id,
      dto,
    }: {
      id: string;
      dto: { isMale?: boolean; yearOfBirth?: number; memberTypeId?: string };
    }) => {
      return await prisma.profile.update({
        where: { id },
        data: dto,
      });
    },
    changeUser: async ({
      id,
      dto,
    }: {
      id: string;
      dto: { name?: string; balance?: number };
    }) => {
      return await prisma.user.update({
        where: { id },
        data: dto,
      });
    },
    subscribeTo: async ({ userId, authorId }: { userId: string; authorId: string }) => {
      await prisma.subscribersOnAuthors.create({
        data: {
          subscriberId: userId,
          authorId,
        },
      });
      return true;
    },
    unsubscribeFrom: async ({
      userId,
      authorId,
    }: {
      userId: string;
      authorId: string;
    }) => {
      await prisma.subscribersOnAuthors.deleteMany({
        where: {
          subscriberId: userId,
          authorId,
        },
      });
      return true;
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
