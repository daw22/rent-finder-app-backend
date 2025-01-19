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
  type RegisterResult{
    token: String!
  }
  type Query{
    me: String 
  }

  
  type Mutation{
    # verify email
    requestRegistration(email: String!, password: String!, role: String!): Success!
    # resend email verification token
    resendToken(email: String!): Success!
    # account registration
    register(token: String!, email: String!): RegisterResult!,
    # login  
    login(userName: String, email: String, password: String!): LoginResult
  }
`
export default authTypeDefs;