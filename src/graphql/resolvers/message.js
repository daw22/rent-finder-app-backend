import { GraphQLError } from 'graphql';
import Conversation from '../../models/conversation.js';
import pubsub from '../../utils/pubsub.js';

const messageResolvers = {
  Query:{
    getMessages: async (_, args, { user })=>{
      try{
        const { conversationId } = args;
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new GraphQLError("conversation not found.");
        // check if user is in the conversation
        if (user.proile._id != conversation.akeray){
          if ( user.profile._id != conversation.tekeray)
            throw new GraphQLError("user not in the conversation")
        }
        return conversation.messages;
      }catch(error){
        console.log(error.message);
        return []
      }
    }
  },
  Mutation:{
    addMessage: async (_, args, {user})=>{
      try{
        if (!user?.profile) throw new GraphQLError("unauthorize");
        // get args
        const {recipient, messageContent} = args;
        // if no conversation create new convresation
        const akeray = user.profile.properties ? user.profile._id : recipient;
        const tekeray = user.profile.properties ? recipient : user.profile._id;
        let conversation = await Conversation.findOne({akeray, tekeray});
        const newMessage = { 
          sender: user.profile._id, 
          content: messageContent,
          timestamp: new Date()
         };
        if (!conversation){
          conversation = await Conversation.create({
            akeray,
            tekeray,
            messages: [ newMessage ],
            updatedAt: new Date()
          })
        }else{ // if conversation exist
          conversation.messages = [...conversation.messages, newMessage]
          conversation.updatedAt = new Date();
          await conversation.save();
        }
        // publish new message event
        pubsub.publish(`new_message_${recipient}`, {messageAdded: newMessage});
        return newMessage;
      }catch(error){
        console.log(error.message);
        return null;
      }
    }
  },
  Subscription:{
    messageAdded: {
      subscribe: (_, __, {user})=> {
        try{
          if (!user?.profile) throw new GraphQLError("unauthorized");
          return pubsub.asyncIterator(`new_message_${user.profile._id}`);
        }catch(error){
          console.log(error.message);
          return null;
        }
      } 
    }
  }
}

export default messageResolvers;