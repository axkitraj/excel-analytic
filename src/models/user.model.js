import { Schema, model } from "mongoose";

const UserSchema = new Schema(
    {
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },

        firstName: String,
        lastName: String,

        files: [{ type: Schema.Types.ObjectId, ref: "File" }],
        analytics: [{ type: Schema.Types.ObjectId, ref: "Analytic" }]
    },
    { timestamps: true }
);

export default model("User", UserSchema);
