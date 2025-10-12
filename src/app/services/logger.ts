import { Injectable } from '@angular/core';
import { Enums } from '@lib/enums';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private logs: string[] = [];
  
  public print(message: any) {
    this.logs.push(message);
    console.log(message);
  }

  public error(message: any) {
    this.logs.push(message);
    console.error()
  }

  public appError(message: any) {
    this.error("Error: " + message);
  }


}
