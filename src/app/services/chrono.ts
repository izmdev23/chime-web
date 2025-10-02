import { Injectable } from "@angular/core";


@Injectable({
    providedIn: "root"
})
export class Chrono {
    private date: Date = new Date();
    
    constructor() {}

    public getYear() {
        return this.date.getFullYear();
    }
}