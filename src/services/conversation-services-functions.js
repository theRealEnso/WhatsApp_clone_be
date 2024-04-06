import createHttpError from "http-errors";

import { ConversationModel } from "../models/conversationModel.js";
import { UserModel } from "../models/userModel.js";

export const findConversationBetweenTwoUsers = async (senderId, receiverId) => {
    let foundConversation = await ConversationModel.find({
        isGroupConversation: false,
        $and: [
            {users: {$elemMatch: {$eq: senderId}}},
            {users: {$elemMatch: {$eq: receiverId}}},
        ]
    })
    //find method only returns documents without any populated data besides the user ID's. We want the document to have additional information about the user(s) as defined in our userSchema/model as well, hence why we use the populate method => accepts an object with a `path` key that specifies what field in the conversationSchema we want to populate (in this case, the `users` field/key in the conversationSchema, which specifically references documents in the userSchema/Model), second is the `select` key, which specifies what pieces of data we want to include (cannot also exclude at the same time i.e "firstName lastName email picture status -password -confirmPassword")
    .populate({
        path: "users",
        select: "firstName lastName email picture status",
    })
    .populate("latestMessage");

    if(!foundConversation) throw createHttpError.BadRequest("Whoops! Looks like something went wrong...");

    //in addition, further populate the latestMessage.sender field within our `foundConversation` document with additional data from the UserModel
    //populate information about the sender of the latest message
    foundConversation = await UserModel.populate(foundConversation, {
        path: "latestMessage.sender",
        select: "firstName lastName email picture status"
    });
    // console.log(foundConversation);
    // return foundConversation;
    console.log(foundConversation[0]);
    return foundConversation[0];
};

export const createNewConversation = async (convoData) => {
    const newConversation = await ConversationModel.create(convoData);

    if(!newConversation) throw createHttpError.BadRequest("Whoops! Looks like something went wrong...");

    return newConversation;
};

export const populateConversation = async (conversationId, fieldsToPopulate, dataToInclude) => {
    const foundConversation = await ConversationModel.findById(conversationId);

    if(!foundConversation) {
        throw createHttpError.BadRequest("Whoops! Looks like something went wrong...")
    } else {
        const populatedConversation = foundConversation.populate({
            path: fieldsToPopulate,
            select: dataToInclude
        });

        return populatedConversation;
    };
};

export const getAllUserConversations = async (userId) => {
    const foundConversations = await ConversationModel.find({
        users: {$elemMatch: {$eq: userId}}
    })
    .populate({
        path: "users",
        select: "firstName lastName email picture status"
    })
    .populate({
        path: "isAdmin",
        select: "firstName lastName email picture status"
    })
    .populate({
        path: "latestMessage",
    })
    .sort({updatedAt: -1}) // list the newest conversation first

    if(!foundConversations) throw createHttpError.BadRequest("Whoops! Looks like something went wrong...");

    const populatedConversations = UserModel.populate(foundConversations, {
        path: "latestMessage.sender",
        select: "firstName lastName email picture status",
    })

    return populatedConversations;
};


