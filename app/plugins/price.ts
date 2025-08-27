export default defineNuxtPlugin(() => {
    return {
        provide: {
            priceFormat: (value: number) => {
                return value && value.toFixed(2).replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1 ');
            }
        }
    }
})