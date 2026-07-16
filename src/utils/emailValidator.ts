import validator from "deep-email-validator";

export async function isValidEmailDomain(email: string): Promise<boolean> {
  try {
    const result = await Promise.race([
      validator({
        email,
        validateRegex: true,
        validateMx: true,
        validateTypo: false,
        validateDisposable: true,
        validateSMTP: false,
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
    ]);
    return result === null ? true : result.valid;
  } catch {
    return true;
  }
}