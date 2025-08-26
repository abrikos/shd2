import mitt from 'mitt'

declare module "#app" {
    interface NuxtApp {
        $event: Function;
        $listen: Function;
    }
}
export default defineNuxtPlugin(() => {
    const emitter = mitt()

    return {
        provide: {
            event: emitter.emit, // Will emit an event
            listen: emitter.on // Will register a listener for an event
        }
    }
})