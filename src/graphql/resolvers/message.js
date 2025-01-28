import { GraphQLError } from 'graphql';
import Conversation from '../../models/conversation.js';
import pubsub from '../../utils/pubsub.js';

const messageResolvers = {
  Query:{
    getMessages: async (_, args, { user })=>{
      try{
        if (!user?.profile) throw new GraphQLError("unauthorized");
        const { conversationId } = args;
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new GraphQLError("conversation not found.");
        // check if user is in the conversation
        if (!user.profile._id.equals(conversation.akeray)){
          if (!user.profile._id.equals(conversation.tekeray))
            throw new GraphQLError("user not in the conversation")
        }
        return conversation.messages;
      }catch(error){
        console.log(error.message);
        return []
      }
    },
    getConversations: async (_, __, { user })=>{
      try{
        if (!user?.profile) throw new GraphQLError("unauthorized");
        const role = user.profile.properties ? "akeray" : "tekeray";
        // get all conversations the user have
        let conversations = [];
        if (role === "akeray") {
          conversations = await Conversation.find({akeray: user.profile._id});
        }else{
          conversations = await Conversation.find({tekeray: user.profile._id});
        }
        return conversations;
      }catch(error){
        console.log(error.message);
        return []
      }
    },
    getUnreadMessages: async (_, __, {user})=>{
      try{
        if (!user?.profile) throw new Error("unauthorized");
        const role = user.profile.properties ? 'akeray' : 'tekeray';
        // get unread messages from all conversations
        let unreadConversations = [];
        if (role === 'akeray'){
          unreadConversations = await Conversation.find(
            {
              akeray: user.profile._id,
              messages: { $elemMatch: { isRead: false, sender: {$ne: user.profile._id} } }
            },
            {
              _id: 1,
              property: 1,
              akeray: 1,
              tekeray: 1,
            }
          );
        }
        if (role === 'tekeray'){
          unreadConversations = await Conversation.find(
            {
              tekeray: user.profile._id,
              messages: { $elemMatch: { isRead: false, sender: {$ne: user.profile._id} } }
            },
            {
              _id: 1,
              property: 1,
              akeray: 1,
              tekeray: 1,
            }
          );
        }
        return unreadConversations;
      }catch(error){
        console.log(error.message);
        throw new GraphQLError(error.message);
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
        if (!conversation && user.profile.properties) 
          throw new GraphQLError("land-loards can't initiate conversations");
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
    },
    markReadMessages: async (_, args, {user})=>{
      try{
        if (!user?.profile) throw new GraphQLError("unauthorized");
        // get conversation and message ids
        const { conversationId, messageIds } = args;
        const result = await Conversation.updateOne(
          {
            _id: conversationId,
          },
          {
            $set: { "messages.$[elem].isRead": true }, // Update all matched elements
          },
          {
            arrayFilters: [{ "elem._id": { $in: messageIds } }], // Match multiple messages
          }
        );
        return result.modifiedCount > 0;
      }catch(error){
        console.log(error.message);
        return false;
      }
    },
    deleteMessage: async (_, args, {user})=>{
      try{
        if (!user?.profile) throw new GraphQLError("unauthorized");
        // get conversation and message ids
        const { conversationId, messageId } = args;
        await Conversation.updateOne(
          {
            _id: conversationId,
          },
          { $pull: {
            messages: {_id: messageId}
          }}
        );
        return true;
      }catch(error){
        console.log(error.message);
        return false;
      }
    },
    deleteConversation: async(_, args, {user})=>{
      try{
        if (!user?.profile) throw new Error("unauthorized");
        // conversationId
        const {conversationId} = args;
        //delete the conversation
        const deletedConversation = await Conversation.deleteOne({_id: conversationId});
        if (deletedConversation){
          return true
        }else{
          return false;
        } 
      }catch(error){
        console.log(error.message);
        throw new GraphQLError("error.message");
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