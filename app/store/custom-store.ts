import {defineStore} from 'pinia';



interface UserPayloadInterface {
    email: string;
    password: string;

}

export const useCustomStore = defineStore('auth', {
    state: (): { loading: boolean, loggedUser: IUser | undefined, redirect: string } => ({
        loggedUser: undefined,
        loading: false,
        redirect: '',
    }),
    actions: {
        setRedirect(path: string) {
            this.redirect = path
        },
        setLoading() {
            this.loading = true
        },
        unsetLoading() {
            this.loading = false
        },
        async getUser(){
            if (!this.loggedUser) {
                this.loggedUser = await useNuxtApp().$GET('/user/checkAuth') as IUser|undefined;
            }
            return this.loggedUser
        },
        async authenticateUser(body: UserPayloadInterface) {
            const config = useRuntimeConfig()
            const data: any = await useNuxtApp().$POST(`/user/login`, body)
            if (!data) return
            this.loggedUser = data
            navigateTo(this.redirect)
        },
        async signupUser(body: UserPayloadInterface) {
            const config = useRuntimeConfig()
            const data: any = await useNuxtApp().$PUT(`/user/signup`, body)
            if (!data) return
            this.loggedUser = await this.getUser()
            navigateTo('/')
        },
        async logUserOut() {
            await useNuxtApp().$GET(`/user/logout`)
            this.loggedUser = undefined
            navigateTo('/user/login')
        },

    },
});
