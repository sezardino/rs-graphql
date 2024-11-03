import { buildSchema } from 'graphql';

export const gqlSchema = buildSchema(`
  type User {
    id: ID!
    name: String!
    balance: Float!
  }

  type Post {
    id: ID!
    title: String!
    content: String
  }

  type Profile {
    id: ID!
    isMale: Boolean!
    yearOfBirth: Int!
  }

  type MemberType {
    id: ID!
    discount: Float!
    postsLimitPerMonth: Int!
  }

  type Query {
    users: [User]!
    posts: [Post]!
    profiles: [Profile]!
    memberTypes: [MemberType]!
  }
`);
