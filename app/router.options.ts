import type { RouterConfig } from '@nuxt/schema'
import type { RouteRecordRaw } from 'vue-router';
import axios from 'axios';
const validateSubdomain =  (host: string) => {
    const subdomain = host.split('.')[0];
    const { ssrContext } = useNuxtApp();
    let routeDirectorys = (subdomain !== 'www' && subdomain !== 'localhost' && subdomain !== 'localhost:3000') ? 'tenant' : 'central';
     if(routeDirectorys == "tenant"){
        try {
            if (process.server && ssrContext?.event.node.req) {
                const req = ssrContext.event.node.req;
                const subdomain = host.split('.')[0];
               // const response = await axios.get(`https://yourapi.com/validate-subdomain/${subdomain}`);
                // if (!response.data.isValid) {
                //     return "404"
                // }
                console.log("ok",subdomain);
                
                if(subdomain != "azad"){
                    return  "404";
                }
            } else if (process.client) {
                const subdomain = window.location.hostname.split('.')[0];
               // const response = await axios.get(`https://yourapi.com/validate-subdomain/${subdomain}`);
                // if (response.data.isValid) {
                //     return "404"
                // }
                if(subdomain != "azad" ){
                    // return "404";
                }
            }
        } catch (error) {
            console.error('Error validating subdomain:', error);
            // Handle error, maybe default to 'central' or handle differently
        }
     }  

    return routeDirectorys;
};

const isUnderDirectory = (route: RouteRecordRaw, directory: string): boolean => {
    return route.path === `/${directory}` || route.path.startsWith(`/${directory}/`);
};

export default <RouterConfig>{
    routes:(_routes) => {
        const { ssrContext } = useNuxtApp();
        let routesDirectory: any;
        if (process.server && ssrContext?.event.node.req) {
            const req = ssrContext.event.node.req;
            routesDirectory = validateSubdomain(req.headers.host ?? '');
            if (routesDirectory == "404") {
                return [{
                    redirect: '/404'
                }];
            }
        } else if (process.client) {
            routesDirectory = validateSubdomain(window.location.hostname);
            if (routesDirectory == "404") {
                return [{
                    redirect: '/404'
                }];
            }
        } else {
            routesDirectory = 'central';
        } 
       
   
  
        console.log(routesDirectory);

        const newRoutes = _routes
            .filter(route => route && !isUnderDirectory(route, routesDirectory === 'tenant' ? 'central' : 'tenant'))
            .map(route => {
                if (route && isUnderDirectory(route, routesDirectory)) {
                    return {
                        ...route,
                        path: route.path.replace(`/${routesDirectory}`, '/'),
                        name: route.name || 'index'
                    };
                }
                return route;
            })
            .filter(route => route !== undefined); // Additional filter to remove any undefined routes

        return newRoutes;
    }
};
