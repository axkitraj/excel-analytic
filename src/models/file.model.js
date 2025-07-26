import { Schema, model } from "mongoose";

const FileSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        filename: { type: String, required: true },
        originalName: { type: String, required: true },

        data: [Object],
        mimeType: String,
        size: Number,
    },
    { timestamps: true }
);

export default model("File", FileSchema);
