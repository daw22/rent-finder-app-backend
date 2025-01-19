const authTypeDefs = `#graphql
  union LoginResult = AkerayProfile | TekerayProfile

  type Account{
    _id: ID!,
    username: String!,
    email: String!,
    role: String!,
  }

  type Success{
    success: Boolean!
  }
  type Query{
    me: String 
  }

  
  type Mutation{
    # verify email
    requestRegistration(email: String!): Success!
    # resend email verification token
    resendToken(email: String!): Success!
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
    ): LoginResult
  }
`
export default authTypeDefs;