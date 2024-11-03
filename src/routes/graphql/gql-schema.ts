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

  input ChangePostInput {
    title: String
    content: String
  }

  input ChangeProfileInput {
    isMale: Boolean
    yearOfBirth: Int
    memberTypeId: MemberTypeId
  }

  input ChangeUserInput {
    name: String
    balance: Float
  }

  input CreatePostInput {
    title: String!
    content: String!
    authorId: UUID!
  }

  input CreateProfileInput {
    isMale: Boolean!
    yearOfBirth: Int!
    userId: UUID!
    memberTypeId: MemberTypeId!
  }

  input CreateUserInput {
    name: String!
    balance: Float!
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

  type Mutation {
    createPost(dto: CreatePostInput!): Post
    createUser(dto: CreateUserInput!): User
    createProfile(dto: CreateProfileInput!): Profile

    deletePost(id: UUID!): Boolean
    deleteProfile(id: UUID!): Boolean
    deleteUser(id: UUID!): Boolean

    changePost(id: UUID!, dto: ChangePostInput!): Post
    changeProfile(id: UUID!, dto: ChangeProfileInput!): Profile
    changeUser(id: UUID!, dto: ChangeUserInput!): User

    subscribeTo(userId: UUID!, authorId: UUID!): Boolean
    unsubscribeFrom(userId: UUID!, authorId: UUID!): Boolean
  }
`);
