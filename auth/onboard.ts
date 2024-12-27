import dotenv from "dotenv";
import { privateKeyToAccount } from "viem/accounts";
dotenv.config()


const signer = privateKeyToAccount(process.env.PRIVATE_KEY);
