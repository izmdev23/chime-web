import { Injectable } from "@angular/core";

interface CacheWrapper<T> {
    data: T;
}

@Injectable({
    providedIn: "root"
})
export class CacheService {
    private data = new Map<string, CacheWrapper<unknown>>();

    public get<T>(key: string) {
        if (this.data.has(key) === false) return undefined;
        let res = this.data.get(key) as CacheWrapper<T>;
        return res.data;
    }

    public set<T>(key: string, value: T) {
        this.data.set(key, {
            data: value
        });
    }

    public contains(key: string) {
        return this.data.has(key);
    }
}