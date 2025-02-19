import createHttpError from "http-errors"

import { MessageModel } from "../models/messageModel.js"

export const createNewMessage = async (msgData) => {
    const createdMessage = await MessageModel.create(msgData);

    if(!createdMessage) throw createHttpError.BadRequest("Whoops! Looks like something went wrong...");

    return createdMessage;
};

export const populateMessage = async (messageId) => {
    const foundMessage = await MessageModel.findById(messageId).populate({
        path: "sender",
        select: "firstName lastName picture",
        model: "UserModel",
    })
    //populate message with information about the conversation
    .populate({
        path: "conversation", // conversation is of type ObjectId that refers to the conversation model
        select: "name isGroupConversation users",
        model: "ConversationModel",
        //then populate information about the users in the conversation. Conversation model has a "users" field, which is an array of ObjectId types that references the UserModel
        populate: {
            path: "users",
            select: "firstName lastName email picture status",
            model: "UserModel",
        }
    });

    if(!foundMessage) throw createHttpError.BadRequest("Whoops! Looks like something went wrong...");

    return foundMessage;
};

export const getMessages = async (convoId) => {
    const foundMessages = await MessageModel.find({conversation: convoId})
    .populate({
        path: "sender", // is type ObjectId that references the UserModel
        select: "firstName lastName email picture status", // populate the firstName, lastName, email, picture, and status of the sender
        model: "UserModel", //references user model
    })
    .populate({
        path: "conversation", // is type ObjectId that references the ConversationModel
        select: "name isGroupConversation users", // populate the name, isGroupConversation, and users
        model: "ConversationModel",
        populate: {
            path: "users", // further populate the users field inside the ConversationModel. This is an array of ObjectId types referencing the UserModel
            select: "firstName lastName email picture status", // populate each user in the users array with their firstName, lastName, email, status, picture
            model: "UserModel" // references user model
        }
    })

    if(!foundMessages) throw createHttpError.BadRequest("Whoops! Looks like something went wrong...");

    return foundMessages;
};
