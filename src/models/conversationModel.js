import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const conversationSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name of conversation is required"],
        trim: true
    },

    isGroupConversation: {
        type: Boolean,
        required: true,
        default: false,
    },

    users: [
        {type: ObjectId, ref: "UserModel"}
    ],

    isAdmin: {
        type: ObjectId,
        ref: "UserModel"
    },

    latestMessage: {
        type: ObjectId,
        ref: "MessageModel"
    }
}, {collection: "conversations", timestamps: true});

export const ConversationModel = mongoose.models.ConversationModel || mongoose.model("ConversationModel", conversationSchema);