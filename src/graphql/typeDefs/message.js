const messageTypeDefs = `#graphql
  type Message{
    sender: ID!,
    content: String!,
    timestamp: String!
  }

  type Conversation{
    akeray: ID!,
    tekeray: ID!,
    messages: [Message!]!,
    updatedAt: String!
  }

  type Query{
    getMessages(conversationId: ID!): [Message!]!,
    getConversations: [Conversation!]!
  }

  type Mutation{
    addMessage(recipient: ID!, messageContent: String!): Message,
    markReadMessage(conversationId: ID!, messageId: ID!): Boolean!
    deleteMessage(conversationId: ID!, messageId: ID!): Boolean!,
    deleteConversation(conversationId: ID!): Boolean!
  }

  type Subscription{
    messageAdded: Message!
  }
`
export default messageTypeDefs;