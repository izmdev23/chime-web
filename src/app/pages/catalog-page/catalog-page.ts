import { Component } from '@angular/core';
import { NavbarLayout } from "@layouts/navbar-layout/navbar-layout";
import { CatalogCard } from "@components/catalog-card/catalog-card";

@Component({
  selector: 'app-catalog-page',
  imports: [NavbarLayout, CatalogCard],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.less'
})
export class CatalogPage {

}
