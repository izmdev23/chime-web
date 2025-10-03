import { Routes } from '@angular/router';
import { ProductViewPage } from '@pages/product-view-page/product-view-page';
import { AccountManagerPage } from '@pages/account-manager-page/account-manager-page';
import { CatalogPage } from '@pages/catalog-page/catalog-page';
import { LoginPage } from '@pages/login-page/login-page';
import { SignupPage } from '@pages/signup-page/signup-page';
import { UploadProductPage } from '@pages/upload-product-page/upload-product-page';

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
    },
    {
        path: "manage-account",
        component: AccountManagerPage
    },
    {
        path: "upload",
        component: UploadProductPage
    }
];
