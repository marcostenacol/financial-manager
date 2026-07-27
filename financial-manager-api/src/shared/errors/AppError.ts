export class AppError extends Error {
  public readonly status_code: number;

  constructor(message: string, status_code = 400) {
    super(message);
    this.name = 'AppError';
    this.status_code = status_code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
