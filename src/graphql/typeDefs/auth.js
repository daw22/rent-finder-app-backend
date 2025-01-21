const authTypeDefs = `#graphql
  union LoginResult = AkerayProfile | TekerayProfile

  type LoginResponse{
    profile: LoginResult,
    token: String!
  }
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
    # login  
    login(unOrEmail: String!, password: String!): LoginResponse!
  }

  type Mutation{
    # verify email
    requestRegistration(email: String!, password: String!, role: String!): Success!
    # resend email verification token
    resendToken(email: String!): Success!
    # account registration
    register(token: String!, email: String!): RegisterResult!,
    changePassword(oldPassword: String!, newPassword: String!): Success!,
  }
`
export default authTypeDefs;