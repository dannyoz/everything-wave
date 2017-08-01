<template>
    <component v-if="currentRoute.title" :is="currentRoute.title.toLowerCase()"></component>
</template>

<script>
    import routing from '../../../express/routing';
    import home from '../home/home.vue';
    import builder from '../builder/builder.vue';
    export default {
        data() {
            return {
                currentRoute : {},
            }
        },
        components: {
            home,
            builder,
        },
        ready() {
            const currentPath = location.pathname;
            var currentRoute = routing.routes.filter((route) => {
                return route.path === currentPath;
            });
            this.currentRoute = currentRoute[0];
        },
    }
</script>
