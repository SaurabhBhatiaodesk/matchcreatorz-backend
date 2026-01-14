import { IResponse } from '../interfaces/response.interface';

export class ResponseWarn implements IResponse {
  constructor(infoMessage: string, data?: any) {
    this.success = false;
    this.message = infoMessage;
    this.data = data;
  }
  success: boolean;
  message: string;
  data: any[];
}

export class ResponseSuccess implements IResponse {
  constructor(infoMessage: string, data?: any) {
    this.success = true;
    this.message = infoMessage;
    this.data = data;
  }
  success: boolean;
  message: string;
  data: any[];
}
