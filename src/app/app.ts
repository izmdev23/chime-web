import { ChangeDetectorRef, Component, effect, NgZone, signal, SimpleChanges } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from '@services/api';
import { ErrorData, LoginResponseDto } from '@lib/models';
import { CookieService } from 'ngx-cookie-service';
import { ErrorPanel } from "@components/error-panel/error-panel";
import { LogService } from '@services/logger';
import { v4 as uuidv4 } from "uuid";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ErrorPanel],
  templateUrl: './app.html',
  styleUrl: './app.less'
})
export class App {
  protected readonly title = signal('chime-web');
  protected readonly hasError = signal(false);
  protected readonly errorMessage = signal("");
  protected readonly connectedToServer = signal(false);

  protected errors$ = signal<Map<string, ErrorData>>(new Map());

  constructor(
    private cookie: CookieService,
    private api: ApiService,
    protected logger: LogService,
    protected cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    this.logger.onError.subscribe({
      next: (err) => {
        console.log("Emit", err);
        const assignedId = uuidv4();
        setTimeout(() => {
          this.errors$.update(val => {
            val.delete(assignedId);
            return val;
          })
        }, 5000);
        this.errors$.update(val => {
          val.set(assignedId, err);
          return val;
        })
      }
    })
    this.connectServer();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("Change");
    if (changes["errors"]) {
      console.log(changes["errors"].currentValue);
    }
  }



  private connectServer() {
    this.hasError.set(true);
    this.errorMessage.set("Connecting to server...");
    console.warn("Connecting to server...");
    this.api.ping().subscribe({
      error: () => {
        this.hasError.set(true);
        this.errorMessage.set("Cannot connect to server");
        console.error("Cannot connect to server " + this.api.address);
        setTimeout(this.connectServer, 5000);
      },
      complete: () => {
        this.hasError.set(false);
        this.errorMessage.set("");
        this.autoLogin();
      }
    })
  }

  autoLogin() {
    if (this.cookie.check("auth")) {
      console.warn("logging in automatically", "feature not yet properly implemented");
      let auth = JSON.parse(this.cookie.get("auth")) as LoginResponseDto;
    }
  }
}
