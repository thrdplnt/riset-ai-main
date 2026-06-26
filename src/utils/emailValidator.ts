import validator from "deep-email-validator";

export async function isValidEmailDomain(email: string): Promise<boolean> {
  try {
    const result = await validator({
      email,
      validateRegex: true,
      validateMx: true,
      validateTypo: false,
      validateDisposable: true,
      validateSMTP: false,
    });
    return result.valid;
  } catch {
    return true; // fail-safe: kalau validator error, jangan blokir user
  }
}