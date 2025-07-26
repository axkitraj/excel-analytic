import { Schema, model } from "mongoose";

const AnalyticSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        fileId: { type: Schema.Types.ObjectId, ref: "File" },

        preview: [Object],
        insights: [String],
    },
    { timestamps: true }
);

export default model("Analytic", AnalyticSchema);
