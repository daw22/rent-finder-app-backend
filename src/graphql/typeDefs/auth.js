const authTypeDefs = `#graphql
  type Account{
    _id: ID!,
    username: String!,
    email: String!,
    role: String!,
    profile: AkerayProfile | TekerayProfile
  }

  type Query{
    me: Account 
  }

  type Mutation{
    # account registration
    register(
      userName: String!,
      email: String!,
      role: String!,
      password: String!
    ): Account,
    
    # login  
    login(
      userName: String,
      email: String,
      password: String!
    ): AkeryaProfile | TekerayProfile
  }
`
export default authTypeDefs;