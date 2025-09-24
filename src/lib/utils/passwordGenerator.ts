export class PasswordGenerator {
  private static readonly LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
  private static readonly UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  private static readonly NUMBERS = "0123456789";
  private static readonly SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  static generate(length: number = 12): string {
    if (length < 8) {
      throw new Error("Password length must be at least 8 characters");
    }

    const mandatoryChars = [
      this.getRandomChar(this.LOWERCASE),
      this.getRandomChar(this.UPPERCASE),
      this.getRandomChar(this.NUMBERS),
      this.getRandomChar(this.SPECIAL_CHARS),
    ];

    const allChars =
      this.LOWERCASE + this.UPPERCASE + this.NUMBERS + this.SPECIAL_CHARS;

    const remainingLength = length - mandatoryChars.length;

    const remainingChars = Array.from({ length: remainingLength }, () =>
      this.getRandomChar(allChars)
    );

    // Combine and shuffle all characters
    const allPasswordChars = [...mandatoryChars, ...remainingChars];
    return this.shuffleArray(allPasswordChars).join("");
  }

  private static getRandomChar(charset: string): string {
    const randomIndex = Math.floor(Math.random() * charset.length);
    return charset[randomIndex];
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
