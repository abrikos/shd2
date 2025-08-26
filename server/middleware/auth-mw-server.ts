import {Token} from "~~/server/models/token.model";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const cookies = parseCookies(event)
    await Token.deleteExpiredTokens()
    if(!cookies[config.public.authTokenName]) return
    const token  = await Token.findOne({access: cookies[config.public.authTokenName]})
        .populate({path:'user'});

    if (token?.user) {
        const {user} = token
        if(token.expired){
            //console.log('Token refresh', authExpiration , token?.secondsFromCreation)
            await utils.setAuthToken(event, user)
        }
        if(!user.isAdmin){
            user.isAdmin = user.email === 'abrikoz@gmail.com' || (user.strategyId === '14278211' && user.strategy === 'telegram')
        }
        event.context.user = utils.adaptUser(user)
    }
})
