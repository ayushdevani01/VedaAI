import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/user.model";
import { env } from "../config/env";

const JWT_EXPIRES = "7d";


export interface AuthTokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  school?: string;
}

function signToken(user: IUser): string {
  const payload: AuthTokenPayload = {
    userId: (user._id as object).toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    school: user.school,
  };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: JWT_EXPIRES });
}

export const authService = {
  async register(name: string, email: string, password: string, school?: string) {
    const existing = await User.findOne({ email });
    if (existing) throw Object.assign(new Error("Email already registered"), { statusCode: 409 });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed, school });
    const token = signToken(user);

    return {
      token,
      user: {
        id: (user._id as object).toString(),
        name: user.name,
        email: user.email,
        school: user.school,
        role: user.role,
      },
    };
  },

  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });

    const token = signToken(user);

    return {
      token,
      user: {
        id: (user._id as object).toString(),
        name: user.name,
        email: user.email,
        school: user.school,
        role: user.role,
      },
    };
  },

  verifyToken(token: string): AuthTokenPayload {
    return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
  },

  async updateProfile(userId: string, name: string, school?: string) {
    const user = await User.findById(userId);
    if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

    user.name = name;
    if (school !== undefined) user.school = school;
    await user.save();

    const token = signToken(user);
    return {
      token,
      user: {
        id: (user._id as object).toString(),
        name: user.name,
        email: user.email,
        school: user.school,
        role: user.role,
      },
    };
  },

};
