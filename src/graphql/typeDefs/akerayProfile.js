const akerayProfileTypeDefs =`#graphql
  type AkerayProfile{
    _id: ID!,
    firstName: String!,
    lastName:String!,
    profilePic: String,
    gender: String!,
    phoneNumber: String!,
    properties: [String!]!
    city: String!
  }

  type Query{
    akerayProfile(id: ID!): AkerayProfile,
    akeray: [AkerayProfile!]!
  }

  type Mutation{
    createAkerayProfile(
      firstName: String!,
      lastName: String!,
      gender: String!,
      profilePic: String,
      phoneNumber: String!,
      city: String!,
    ): AkerayProfile,

    updateAkerayProfile(
      id: ID!,
      firstName: String,
      lastName: String,
      phoneNumber: String,
      city: String
    ): AkerayProfile,

    deleteAkeray(id: ID!): AkerayProfile
  }
`

export default akerayProfileTypeDefs;