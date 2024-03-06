export interface ErrorResponseInterface {
  errorCode: string;
  message: string;
}
export enum ErrorCode {
  networkNotAvaiable = '0',
  internalServerError = '5000',
  unAuthentication = '401',
}
