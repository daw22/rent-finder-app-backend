const tekerayProfileTypeDefs =`#graphql
  type TekerayProfile{
    _id: ID!,
    firstName: String!,
    lastName:String!,
    profilePic: String,
    gender: String!,
    phoneNumber: String!,
    city: String!,
    idPic: String
  }

  type Query{
    tekeray(id: ID!): TekeryaProfile,
  }

  type Mutation{
    createTekeryaProfile(
      firstName: String!,
      lastName: String!,
      gender: String!,
      profilePic: String,
      phoneNumber: String!,
      city: String!,
    ): TekeryaProfile,

    updateTekerayProfile(
      id: ID!,
      firstName: String,
      lastName: String,
      phoneNumber: String,
      profilePic: String,
      city: String
    ): TekerayProfile,

    deleteTekeray(id: ID!): TekeryaProfile
  }
`

export default tekerayProfileTypeDefs;