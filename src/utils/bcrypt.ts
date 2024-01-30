import * as bcrypt from 'bcrypt';

export function encodePassword(password: string): string {
  const SALT = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, SALT);
}

export function comparePassword(
  password: string,
  passwordHash: string,
): boolean {
  return bcrypt.compareSync(password, passwordHash);
}
