export default defineNuxtPlugin(() => {
    return {
        provide: {
            validateRequired: (v:string) => !!v || 'Поле обязательно',
            validateEmail: (v:string) => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,6})+$/.test(v) || 'Не верный e-mail',
            validatePhone: (v:string) => !v ? true : !!v.match(/^\+7\d\d\d\d\d\d\d\d\d\d$/) || 'Не верный телефон'
        }
    }
})