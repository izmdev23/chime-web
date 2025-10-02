import { Component } from '@angular/core';
import { Navbar } from "@components/navbar/navbar";
import { Footer } from "@components/footer/footer";

@Component({
  selector: 'app-navbar-layout',
  imports: [Navbar, Footer],
  templateUrl: './navbar-layout.html',
  styleUrl: './navbar-layout.less'
})
export class NavbarLayout {

}
