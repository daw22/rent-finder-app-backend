const propertyTypeDefs =`#graphql
  type Location {
    type: String!
    coordinates: [Float!]! # [longitude, latitude]
  }
 type Address{
  country: String!,
  city: String!,
  streetName: String,
  location: Location,
  houseNumber: String
 }

 type Property{
  id: ID!,
  propertyType: String!,
  pics: [String!]!,
  owner: AkerayProfile,
  price: Float,
  numberOfRooms: Int!,
  description: String!,
  status: String!,
  utilities: [String!]!,
  maxOcupantAllowed: Int!,
  address: Address!,
 }

 type Query{
  getProperty(id: ID!): Property,
  getMyProperties: [Property!]!,
  getProperties(city: String!, minPrice: Float, maxPrice: Float, propertyType: String): [Property!]!
 }

 type Mutation{
  # create a new property
  createProperty(
    propertyLabel: String
    propertyType: String!,
    price: Float,
    numberOfRooms: Int,
    description: String!,
    utilities: [String!]!,
    maxOcupantAllowed: Int!,
    allowCalling: Boolean,
    status: String!,
    preferedTenants: String,
    country: String,
    city: String!,
    streetName: String,
    houseNumber: String
    location: String,
    pics: [String]
  ): Property!

  # update property
  updateProperty(
    id: ID!,
    propertyType: String,
    price: Float,
    numberOfRooms: Int,
    description: String,
    utilities: [String],
    maxOcupantAllowed: Int,
    allowCalling: Boolean,
    status: String
  ): Property!

  #delete property
  deleteProperty(propertyId: ID!): Boolean!
 }
`

export default propertyTypeDefs;