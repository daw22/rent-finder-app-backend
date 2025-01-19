const propertyTypeDefs =`#graphql
 type Address{
  id: ID!,
  country: String!,
  city: String!,
  streetName: String,
  location: String,
  houseNumber: String
 }

 type Property{
  id: ID!,
  propertyType: String!,
  pics: [String!]!,
  owner: AkerayProfile,
  price: Number!,
  numberOfRooms: Number!,
  description: String!,
  status: String!,
  amenities: [String!]!,
  maxOcupantAllowed: Number!,
  address: Address!,
  allowCalling: Boolean!
 }

 type Query{
  property(id: ID!): Property,
  properties(city: String!, minPrice: String, maxPrice: String, propertyType: String): [Property!]!
 }

 type Mutation{
  # create a new property
  createProperty(
    propertyType: String!,
    price: Number!,
    numberOfRooms: Number,
    description: String!,
    amenities: [String!]!,
    maxOcupantAllowed: Number!,
    address: Address!,
    allowCalling: Boolean
  ): Property!

  # update property
  updateProperty(
    id: ID!,
    propertyType: String,
    price: Number,
    numberOfRooms: Number,
    description: String,
    amenities: [String],
    maxOcupantAllowed: Number,
    address: Address,
    allowCalling: Boolean
  ): Property!
 }
`

export default propertyTypeDefs;