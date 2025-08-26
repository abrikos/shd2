import {useCustomStore} from '~/store/custom-store'
import moment from "moment";

export default defineNuxtPlugin((_nuxtApp) => {
    const config = useRuntimeConfig()
    const toast = useToast();
    const {logUserOut, setLoading, unsetLoading} = useCustomStore()

    function getHeaders() {
        const token = localStorage.getItem(config.public.authTokenName)
        return {Authorization: `Bearer ${token}`}
    }


    function onError(e: any) {
        if (e.status === 401) logUserOut()
        console.log('zzzzzzzz')
        toast.add({
            duration: undefined,
            title: '',
            color: 'error',
            icon: 'i-mdi:alert-circle',
            description: e.request + ' ' + e.status + ':' + (e.response._data.message || e.response._data)
        })
    }

    async function refresh() {
        const expire = localStorage.getItem(config.public.authTokenName + 'expire')
        if (expire) {
            const diffMinutes = moment(expire).diff(moment()) / 1000 / 60
            if (diffMinutes < 10) {
                const data = await $fetch('/api/v1/user/refresh_token', {headers: getHeaders()}).catch(onError) as {
                    token: string,
                    expire: string
                }
                if (data) {
                    localStorage.setItem(config.public.authTokenName, data.token)
                    localStorage.setItem(config.public.authTokenName + 'expire', data.expire)
                }
            }
        }
    }

    const debug = true
    const showResponse = false
    const apiPath = '/api'
    return {
        provide: {
            async POST(path: string, body?: any) {
                setLoading()
                //await new Promise(resolve => setTimeout(resolve, 5000));
                if (debug) console.log('POST', path, body);
                await refresh()
                const res = await $fetch(apiPath + path, {method: 'POST', body, headers: getHeaders()})
                    .catch(onError)
                if (res && debug && showResponse) console.log('POST response:', path, res)
                unsetLoading()
                return res
            },
            async PATCH(path: string, body?: any) {
                setLoading()
                //await new Promise(resolve => setTimeout(resolve, 5000));
                if (debug) console.log('PATCH', path, body);
                await refresh()
                const res = await $fetch(apiPath + path, {method: 'PATCH', body, headers: getHeaders()})
                    .catch(onError)
                if (res && debug && showResponse) console.log('PATCH response:', path, res)
                unsetLoading()
                return res
            },
            async PUT(path: string, body?: any) {
                setLoading()
                if (debug) console.log('PUT', path, body);
                await refresh()
                const res = await $fetch(apiPath + path, {method: 'PUT', body, headers: getHeaders()})
                    .catch(onError)
                if (res && debug && showResponse) console.log('PUT response:', path, res)
                unsetLoading()
                return res
            },
            async GET(path: string) {
                setLoading()
                await refresh()
                if (debug) console.log('GET', path);
                let res = await $fetch(apiPath + path, {method: 'GET', headers: getHeaders()})
                    .catch(onError)
                if (res && debug && showResponse) console.log('GET response:', path, res)
                unsetLoading()
                return res
            },
            async DELETE(path: string) {
                setLoading()
                await refresh()
                if (debug) console.log('DEL', path);
                const res = await $fetch(apiPath + path, {method: 'DELETE', headers: getHeaders()})
                    .catch(onError)
                if (res && debug && showResponse) console.log('DEL response:', path, res)
                unsetLoading()
                return res
            },
        }
    }
})
