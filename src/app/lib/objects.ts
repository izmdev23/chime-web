export class ErrorStruct {
    private errors = new Map<string, string>();

    set(key: string, message: string) {
        this.errors.set(key, message);
    }

    get(key: string) {
        return this.errors.get(key);
    }

    delete(key: string) {
        this.errors.delete(key);
    }

    toString(): string {
        let message = "";
        let i = 0;
        for(const err of this.errors) {
            message += err[1];
            if (i !== this.errors.size) {
                message += " "
            }
            i++;
        }
        return message;
    }

}