import { Routes } from '@angular/router';
import { ProductViewPage } from '@components/product-view-page/product-view-page';
import { CatalogPage } from '@pages/catalog-page/catalog-page';
import { LoginPage } from '@pages/login-page/login-page';
import { SignupPage } from '@pages/signup-page/signup-page';

export const routes: Routes = [
    {
        path: "",
        redirectTo: "catalog",
        pathMatch: "full"
    },
    {
        path: "catalog",
        component: CatalogPage
    },
    {
        path: "login",
        component: LoginPage
    },
    {
        path: "product",
        component: ProductViewPage
    },
    {
        path: "signup",
        component: SignupPage
    }
];
