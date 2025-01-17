const akerayProfileTypeDefs =`#graphql
  type AkeryaProfile{
    _id: ID!,
    firstName: String!,
    lastName:String!,
    profilePic: String,
    gender: String!,
    phoneNumber: String!,
    properties: [string!]!
    city: String!
  }

  type Query{
    akerayProfile(id: ID!): AkeryaProfile,
    akeray: [AkerayProfile!]!
  }

  type Mutation{
    createAkeryaProfile(
      firstName: String!,
      lastName: String!,
      gender: String!,
      profilePic: String,
      phoneNumber: String!,
      city: String!,
    ): AkeryaProfile,

    updateAkerayProfile(
      id: ID!,
      firstName: String,
      lastName: String,
      phoneNumber: String,
      profilePic: String,
      city: String): AkerayProfile,

    deleteAkeray(id: ID!): AkeryaProfile
  }
`

export default akerayProfileTypeDefs;