import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, signal, WritableSignal } from '@angular/core';
import { ApiService } from '@services/api';
import { User } from '@lib/models';
import { Subscription } from 'rxjs';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-account-details',
  imports: [FormsModule],
  templateUrl: './account-details.html',
  styleUrl: './account-details.less'
})
export class AccountDetails {
  @Input() userId = "";

  protected editMode = signal(false);
  protected userName = signal("");
  protected password = signal("unedited-password");
  protected role = signal("");
  protected firstName = signal("");
  protected middleName = signal("");
  protected lastName = signal("");

  protected user: User = {
    firstName: "Empty",
    lastName: "Empty",
    middleName: "Empty",
    role: "Guest",
    userName: "Empty"
  };
  
  private subs: Subscription[] = [];

  constructor(
    protected api: ApiService
  ) {}

  ngOnInit() {
    let result = this.api.getUserData();
    if (result === undefined) {
      console.error("Error: User is not logged in");
      return;
    }
    let sub = result.subscribe({
      next: response => {
        console.log(response);
        this.userName.set(response.data.userName);
        this.role.set(response.data.role);
        this.firstName.set(response.data.firstName);
        this.middleName.set(response.data.middleName);
        this.lastName.set(response.data.lastName);
        this.user = response.data;
      },
      error: (response: HttpErrorResponse) => {
        console.error("Error: ", response.error);
      },
      complete: () => {

      }
    });
  }

  toggleEditMode() {
    if (this.editMode()) {
      // when turning off edit mode
      this.userName.set(this.user.userName);
      this.role.set(this.user.role);
      this.firstName.set(this.user.firstName);
      this.middleName.set(this.user.middleName);
      this.lastName.set(this.user.lastName);
    }
    else {
      // when going to edit mode

    }
    
    this.editMode.set(!this.editMode());
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
