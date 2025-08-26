import {useCustomStore} from '~/store/custom-store';
import {storeToRefs} from "pinia"; // import the auth store we just created
export default defineNuxtRouteMiddleware(async (to, from) => {
    const {getUser, setRedirect, redirect} = useCustomStore();
    const {guestPages} = useAppConfig() as unknown as { guestPages: string[] }
    const loggedUser = await getUser()
    if (!guestPages.includes(to.name as string) && !loggedUser) {

        setRedirect(to.fullPath)
        //abortNavigation();
        return navigateTo('/user/login');
    } else if (to.fullPath === '/') {
        return navigateTo('/platforms');
    }
});