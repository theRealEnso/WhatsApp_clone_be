import logger from "../configs/winston-logger.js";
import createHttpError from "http-errors";

import { findUser } from "../services/user-services-functions.js";
import { findConversationBetweenTwoUsers, createNewConversation, populateConversation, getAllUserConversations, findGroupConversation} from "../services/conversation-services-functions.js";


//creating or opening a conversastion
export const createNewOrOpenExistingConversation = async (req, res, next) => {
    try {
        //need id of the sender
        const sender_id = req.user.id; // get this from the auth middleware from authMiddleware.js (decoded jsonwebtoken)

        // need id of the user we are sending to as well as whether or not the conversation is/isn't a group conversation
        const {recipient_id, isGroupConversation} = req.body;
        if(!recipient_id){
            logger.error(`Please provide the ID of the user you want to create a conversation with`);
            throw createHttpError.BadRequest("Whoops! Something went wrong...");
        }

        //if it is not a group conversation, then it must be a conversation between just two users, so proceed with creating/opening conversation with just two users
        if(isGroupConversation === false){
        //check if an existing chat conversation between two already exists. If it does, send it back. Otherwise, create a new conversation, and then populate the new conversation with data of the users excluding their passwords
            const conversationBetweenTwoUsers = await findConversationBetweenTwoUsers(sender_id, recipient_id, false);
            if(conversationBetweenTwoUsers){
                res.json(conversationBetweenTwoUsers);
                return;
            } else {
                const recipient_user = await findUser(recipient_id);
                const conversationData = {
                    name: `${recipient_user.firstName} ${recipient_user.lastName}`,
                    isGroupConversation: false,
                    users: [sender_id, recipient_id]
                }

                const newConversation = await createNewConversation(conversationData);
                // console.log(newConversation);
                const populatedConversation = await populateConversation(newConversation._id, "users", "firstName lastName email picture status");
                // console.log(`I AM THE POPULATED CONVO! : ${populatedConversation}`);
                res.status(200).json(populatedConversation);
            }

        //otherwise, we are indeed working with a group conversation
        } else {
            //find the group conversation using the ID sent from the front end. Front end sends the conversation ID of the group conversation if it is a group convo, or a false boolean value if it is not a group convo
            const groupConvo_id = isGroupConversation;
            const groupConvo = await findGroupConversation(groupConvo_id);
            res.json(groupConvo);
        };
    
    } catch(error) {
        next(error);
    };
};

//create group conversation

export const createGroupConversation = async (req, res, next) => {
    try {
        const sender_id = req.user.id;
        console.log(sender_id);
        const {addedUsers, groupConversationName} = req.body;

        if(!addedUsers || !groupConversationName) throw createHttpError.BadRequest("Please include group conversation name and users you would like to include in the group!");

        if(addedUsers.length < 2) throw createHttpError.BadRequest("At least 2 users are required to start a group chat");

        const users = [...addedUsers, sender_id]

        const groupConversationData = {
            name: groupConversationName,
            isGroupConversation: true,
            users: users,
            admin: sender_id,
            picture: process.env.DEFAULT_GROUP_PICTURE,
        };

        const newGroupConversation = await createNewConversation(groupConversationData);
        const populatedGroupConversation = await populateConversation(newGroupConversation._id, "users", "firstName lastName email picture status");
        res.json(populatedGroupConversation);
        
    } catch(error){
        next(error);
    };
};

//get all conversations of the user that is currently logged in
export const getAllConversations = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const foundConversations = await getAllUserConversations(user_id);

        if(foundConversations){
            res.json(foundConversations);
        } else {
            throw createHttpError.BadRequest("Whoops! Couldn't find what you were looking for")
        }

    } catch(error) {
        next(error)
    };
};