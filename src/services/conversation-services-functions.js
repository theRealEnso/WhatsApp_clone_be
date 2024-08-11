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
    }).populate({
        path: "users", // ConversationModel has a `users` field that is an array that containing objects of type ObjectId's that reference the UserModel
        select: "firstName lastName email picture status", // populate additional information about each user in the users array
        model: "UserModel",
    })
    .populate({ // ConversationModel also has a `latestMessage` field that references the MessageModel
        path: "latestMessage",
        model: "MessageModel",
        populate: { // want to populate additional information about the sender of the latest message. Since the latestMessage is an ObjectId that references the MessageModel (i.e. is an object that contains all the fields/ values inside the MessageModel), we can actually access all the fields in the MessageModel. The MessageModel has a `sender` field that we can access
            path: "sender", // and, since the sender field is an ObjectId type that references the UserModel, we can access  the fields inside of the UserModel as well, meaning we can get additional info about the sender
            select: "firstName lastName email picture status",
            model: "UserModel"
        }
    })
    // .populate({
    //     path: "latestMessage.sender",
    //     select: "firstName lastName email picture status",
    //     model: "UserModel"
    // })
    //find method only returns documents without any populated data besides automatically generated ID that is attached to the document. We want our foundConversation document to have additional information about the user(s) as defined in our userSchema/model as well, hence why we use the populate method => accepts an object with a `path` key that specifies what field in the conversationSchema we want to populate (in this case, the `users` field/key in the conversationSchema, which specifically references documents in the userSchema/Model), second is the `select` key, which specifies what pieces of data we want to include (cannot also exclude at the same time i.e "firstName lastName email picture status -password -confirmPassword")

    // console.log(typeof foundConversation)
    console.log(foundConversation); // prints an array containing conversation object(s)
    console.log(foundConversation[0]); // prints actual conversation object inside the array (at the first index)

    if(!foundConversation) throw createHttpError.BadRequest("Whoops! Looks like something went wrong...");

    // ** OLD CODE, another way of populating data for reference ** //

    //in addition, further populate the latestMessage.sender field within our `foundConversation` document with additional data from the UserModel
    //populate information about the sender of the latest message

    // foundConversation = await UserModel.populate(foundConversation, {
    //     path: "latestMessage.sender",
    //     select: "firstName lastName email picture status"
    // });

    // ** OLD CODE, another way of populating data for reference ** //

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
            select: dataToInclude,
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

    if(!foundConversations){
        throw createHttpError.BadRequest("Whoops! Looks like something went wrong...");
    } else {
        //in addition, further populate the latestMessage.sender field within our `foundConversation` document with additional data from the UserModel
        //populate information about the sender of the latest message
        const populatedConversations = await UserModel.populate(foundConversations, {
            path: "latestMessage.sender",
            select: "firstName lastName email picture status",
        })
    
        return populatedConversations;
    };
}

export const updateLatestMessage = async (conversationId, message) => {
    const updatedMessage = await ConversationModel.findByIdAndUpdate(conversationId, {
        latestMessage: message,
    });

    if(!updatedMessage) throw createHttpError.BadRequest("Whoops! Looks like something went wrong...");

    return updatedMessage;
};