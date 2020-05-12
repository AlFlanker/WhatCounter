let counter = 0;
let all_word = 0;
const answer = {
    count: 0,
    all_count:0
}
onmessage = function(e) {
    const text = e.data;
    all_word += text.split(' ').length;
    let result = text.match(/вот/g);
    if(result && result.length > 0 ) {
        answer.count = result.length;
        answer.all_count = all_word;
        const obj = JSON.parse(JSON.stringify(answer));
        postMessage(obj);
    }
    answer.all_count = all_word;
    console.log(e);
    const obj = JSON.parse(JSON.stringify(answer));
    postMessage(obj);
};
