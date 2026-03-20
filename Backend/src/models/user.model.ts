import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  school?: string;
  role: "teacher" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    school: { type: String, trim: true },
    role: { type: String, enum: ["teacher", "admin"], default: "teacher" },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
