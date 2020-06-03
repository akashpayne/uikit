import {on} from './event';
import {Promise} from './promise';
import {assign, isString, noop} from './lang';

export function ajax(url, options) {
    return new Promise((resolve, reject) => {

        const env = assign({
            data: null,
            method: 'GET',
            headers: {},
            xhr: new XMLHttpRequest(),
            beforeSend: noop,
            responseType: ''
        }, options);

        env.beforeSend(env);

        let {xhr} = env;

        for (const prop in env) {
            if (prop in xhr) {
                try {

                    xhr[prop] = env[prop];

                } catch (e) {}
            }
        }

        xhr.open(env.method.toUpperCase(), url);

        for (const header in env.headers) {
            xhr.setRequestHeader(header, env.headers[header]);
        }

        on(xhr, 'load', () => {

            if (xhr.status === 0 || xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {

                // IE 11 does not support responseType 'json'
                if (env.responseType === 'json' && isString(xhr.response)) {
                    xhr = assign({}, xhr, {response: JSON.parse(xhr.response)});
                }

                resolve(xhr);

            } else {
                reject(assign(Error(xhr.statusText), {
                    xhr,
                    status: xhr.status
                }));
            }

        });

        on(xhr, 'error', () => reject(assign(Error('Network Error'), {xhr})));
        on(xhr, 'timeout', () => reject(assign(Error('Network Timeout'), {xhr})));

        xhr.send(env.data);
    });
}

export function getImage(src, srcset, sizes) {

    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onerror = e => reject(e);
        img.onload = () => resolve(img);

        sizes && (img.sizes = sizes);
        srcset && (img.srcset = srcset);
        img.src = src;
    });

}
