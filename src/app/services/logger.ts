import { Injectable, signal } from '@angular/core';
import { Enums } from '@lib/enums';
import { ErrorData } from '@lib/models';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private logQueue = signal<string[]>([]);
  private logEvent = new Subject<ErrorData>();
  private logs: string[] = [];
  
  public get onError(): Observable<ErrorData> {
    return this.logEvent.asObservable();
  }
  
  public print(message: any) {
    this.logs.push(message);
    this.logEvent.next({
      code: 0,
      message: message,
      type: "log"
    });
  }

  public success(message: any) {
    this.logs.push(message);
    this.logEvent.next({
      code: 0,
      message: message,
      type: "success"
    });
  }

  public warn(message: any) {
    this.logs.push(message);
    this.logEvent.next({
      code: 0,
      message: message,
      type: "warning"
    });
  }
  
  public error(message: any) {
    this.logs.push(message);
    this.logEvent.next({
      code: 0,
      message: message,
      type: "error"
    });
  }

  public appError(message: any) {
    this.error("Error: " + message);
  }


}
