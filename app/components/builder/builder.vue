<template>
    <div>
        <input type="text" v-model="filter" style="width: 500px;">
        <input type="number" v-model="limit">
        <input type="number" v-model="minLength">
        <input type="number" v-model="maxLength">
        <input type="number" v-model="offset">
        <button @click="getWords">Get words</button>
        <h4>Total: {{total}}</h4>
        <div v-if="wordlist.length">
            <p v-for="entry in wordlist">{{entry.word}} wave</p>
        </div>
    </div>
</template>

<script>
    import apiService from '../../shared/api-service';
    import words from '../../shared/words.json';
    const ApiService = new apiService();
    
    export default {
        data(){
            return {
                wordlist: [],
                filter: 'lexicalCategory=Verb,Noun;',
                limit: 50,
                minLength: 2,
                maxLength: 14,
                offset: 0,
                total: 0,
            }
        },
        ready() {
            this.switchWord();
        },
        methods: {
            getWords() {
                const self = this;
                const params = {
                    filter: this.filter,
                    limit: this.limit,
                    minLength: this.minLength,
                    maxLength: this.maxLength,
                    offset: this.offset,
                };

                ApiService.post('wordlist', params).end((err, data) => {
                    console.log(data.body);
                    self.total = data.body.metadata.total;
                    self.wordlist = data.body.results;
                });
            },
            switchWord() {
                console.log('jfdskl');
                let index = 0;
                setInterval(() => {
                    var string = words[index].replace('�', '');
                    console.log(string);
                    index ++;
                }, 100);
            }
        }
    }
</script>
