export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    if (config.public.devMode ) {
        console.log(event.method, event._path)
    }
})