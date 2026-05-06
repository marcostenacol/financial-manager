interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export class ResponseTrait {
  public success<T>(data: T, message = 'Operação realizada com sucesso'): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
    };
  }

  public error(message: string): Omit<ApiResponse<null>, 'data'> {
    return {
      success: false,
      message,
    };
  }
}
