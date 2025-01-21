const tekerayProfileTypeDefs =`#graphql
  type TekerayProfile{
    firstName: String!,
    lastName:String!,
    profilePic: String,
    gender: String!,
    phoneNumber: String!,
    city: String!,
    idPic: String
  }

  type Query{
    tekeray(id: ID!): TekerayProfile,
  }

  type Mutation{
    createTekeryaProfile(
      firstName: String!,
      lastName: String!,
      gender: String!,
      profilePic: String,
      phoneNumber: String!,
      city: String!,
    ): TekerayProfile,

    updateTekerayProfile(
      id: ID!,
      firstName: String,
      lastName: String,
      phoneNumber: String,
      profilePic: String,
      city: String
    ): TekerayProfile,

    deleteTekeray(id: ID!): TekerayProfile
  }
`

export default tekerayProfileTypeDefs;