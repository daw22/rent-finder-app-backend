import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

import authResolvers from "./resolvers/auth.js";
import authTypeDefs from './typeDefs/auth.js';
import AkerayProfileResolvers from './resolvers/akerayProfile.js';

import propertyTypeDefs from "./typeDefs/property.js";
import tekerayProfileTypeDefs from "./typeDefs/tekerayProfile.js";
import akerayProfileTypeDefs from "./typeDefs/akerayProfile.js";

export const typeDefs = mergeTypeDefs([authTypeDefs, tekerayProfileTypeDefs, akerayProfileTypeDefs]);
export const resolvers = mergeResolvers([authResolvers, AkerayProfileResolvers]);