import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ApiService } from '@services/api';
import { ApiResponse } from '@lib/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signup-page',
  imports: [FormsModule],
  templateUrl: './signup-page.html',
  styleUrl: './signup-page.less'
})
export class SignupPage {
  protected step = signal(0);
  protected firstName = signal("");
  protected middleName = signal("");
  protected lastName = signal("");
  protected errorMessage = signal("");
  protected username = signal("");
  protected password = signal("");

  private subs: Subscription[] = [];

  constructor(
    protected location: Location,
    protected api: ApiService
  ) {}
  
  nextStep() {
    this.errorMessage.set("");
    // validate personal information fields
    // wip
    if (this.step() <= 0) {
      if (
        this.firstName().length === 0 ||
        this.middleName().length === 0 ||
        this.lastName().length === 0
      ) {
        this.errorMessage.set("All fields must not be empty");
        return;
      }
    }

    if (this.step() === 1) {
      if (
        this.username().length === 0 ||
        this.lastName().length === 0
      ) {
        this.errorMessage.set("All fields must not be empty");
        return;
      }

      let sub = this.api.signUp({
        username: this.username(),
        password: this.password(),
        firstName: this.firstName(),
        middleName: this.middleName(),
        lastName: this.lastName()
      }).subscribe({
        next: () => {
          console.log("Signup success");
        },
        error: (error: HttpErrorResponse) => {
          let err = error.error as ApiResponse<undefined>;
          this.errorMessage.set(err.message);
          console.error("Error: ", err);
        },
        complete: () => {
          this.location.back();
        }
      });
      this.subs.push(sub);
      return;
    }
    
    this.step.update(val => {
      return ++val
    })
  }

  prevStep() {
    this.errorMessage.set("");
    this.step.update(val => {
      return --val
    })
    if (this.step() < 0) {
      this.location.back();
    }
  }


  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

}
