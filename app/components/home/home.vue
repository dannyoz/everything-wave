<template>
    <div class="home">
        <div class="centre">
            <h1>{{currentWord}}</h1>
            <h2>Wave</h2>
        </div>
    </div>
</template>

<script>
    const wordIndex = (location.search) ? location.search.replace('?word=', '') : 0;

    import words from '../../shared/words-clean.json';
    export default {
        computed: {
            currentWord() {
                return words[wordIndex];
            }
        }
    }
</script>
