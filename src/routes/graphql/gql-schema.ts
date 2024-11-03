import { buildSchema } from 'graphql';

export const gqlSchema = buildSchema(`
  scalar UUID

  type User {
    id: UUID!
    name: String!
    balance: Float!
    profile: Profile
    posts: [Post!]!
    userSubscribedTo: [User!]!
    subscribedToUser: [User!]!
  }

  type Post {
    id: UUID!
    title: String!
    content: String!
  }

  type Profile {
    id: UUID!
    isMale: Boolean!
    yearOfBirth: Int!
    memberType: MemberType!
  }

  enum MemberTypeId {
    BASIC
    BUSINESS
  }

  type MemberType {
    id: MemberTypeId!
    discount: Float!
    postsLimitPerMonth: Int!
  }

  type Query {
    users: [User]!
    user(id: UUID!): User
    posts: [Post]!
    post(id: UUID!): Post
    profiles: [Profile]!
    profile(id: UUID!): Profile
    memberTypes: [MemberType]!
    memberType(id: MemberTypeId!): MemberType
  }
`);
