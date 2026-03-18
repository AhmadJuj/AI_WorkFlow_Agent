import crypto from "crypto";

const ALGO = "aes-256-gcm";
const SECRET = crypto.scryptSync(process.env.MCP_SECRET_KEY!, "salt", 32);

export function encrypt(key: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGO,
    SECRET,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(key, "utf8"),
    cipher.final()
  ]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}:${cipher.getAuthTag().toString("hex")}`;
}

export function decrypt(encryptedKey: string) {
  const [iv, data, tag] = encryptedKey.split(":");

  const decipher = crypto.createDecipheriv(
    ALGO,
    SECRET,
    Buffer.from(iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(tag, "hex"));

  return decipher.update(Buffer.from(data, "hex")) + decipher.final("utf8");
}