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
        path: "conversation",
        select: "name isGroupConversation users",
        model: "ConversationModel",
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
        path: "sender",
        select: "firstName lastName email picture status"
    })
    .populate({
        path: "conversation",
    })

    if(!foundMessages) throw createHttpError.BadRequest("Whoops! Looks like something went wrong...");

    return foundMessages;
};
