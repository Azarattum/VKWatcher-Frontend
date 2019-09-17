var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Class for async AJAX loading with JSON support.
 */
export default class Loader {
    constructor(urls) {
        this.urls = urls;
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            let responses = [];
            for (const url of this.urls) {
                const response = yield this.request("GET", url);
                responses.push(response);
            }
            return [...responses];
        });
    }
    request(method, url) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(function (resolve, reject) {
                let xhr = new XMLHttpRequest();
                //Assume json request
                if (url.replace(new RegExp("/$"), "").endsWith(".json")) {
                    xhr.overrideMimeType("application/json");
                    xhr.responseType = "json";
                }
                xhr.open(method, url);
                xhr.onload = function () {
                    if (this.status >= 200 && this.status < 300) {
                        resolve(xhr.response);
                    }
                    else {
                        reject({
                            status: this.status,
                            statusText: xhr.statusText
                        });
                    }
                };
                xhr.onerror = function () {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                };
                xhr.send();
            });
        });
    }
}
//# sourceMappingURL=loader.class.js.map