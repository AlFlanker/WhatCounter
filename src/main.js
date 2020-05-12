var counterWorker;
if (window.Worker) {
    counterWorker = new Worker("worker.js");
}

window.chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};
window.onload = function () {
    let timeline =[];
    let countWhat = [0];
    let allWord = [0];
    let allWhat = [0];
    let d = new Date();
    timeline.push(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds());

    let config = {
        type: 'line',
        data: {
            labels: timeline,
            // labels: [1,2,3,4,5,6],
            datasets: [{
                label: '\'Вот\'/ секунду',
                backgroundColor: window.chartColors.blue,
                borderColor: window.chartColors.blue,
                data: countWhat,
                // data: [3,2,1,3,1,2],
                fill: false,
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: '\'Вот\' в секунду'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'секунды'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        ticks: {
                            min: Math.min.apply(this, countWhat) ,
                            max: Math.max.apply(this, countWhat) ,
                            stepSize: 1
                        },
                        display: true,
                        labelString: 'кол-во \'Вот\''
                    }
                }]
            }
        }
    };

    let configDoughnut = {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [
                    allWord,
                    allWhat
                ],
                backgroundColor: [
                    window.chartColors.red,
                    window.chartColors.orange
                ],
                label: 'Dataset 1'
            }],
            labels: [
                'Другие слова',
                'Вот'
            ]
        },
        options: {
            responsive: true,
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Все и Вот'
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    };

    var ctx = document.getElementById('chart').getContext('2d');
    window.myLine = new Chart(ctx, config);

    var ctxDoughnut = document.getElementById('chart-area').getContext('2d');
    window.myDoughnut = new Chart(ctxDoughnut, configDoughnut);

    const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    const speechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
    let phrases = [
        'Тест'
    ];
    let time_start;
    let count = document.getElementById('count');
    let count_time = document.getElementById('count_time');
    count.textContent = 0;
    count_time.textContent = 0;

    let testBtn = document.getElementById('start');
    var stop_btn = document.getElementById('stop');
    let c = 0;
    function testSpeech() {
        time_start = performance.now();
        testBtn.disabled = true;
        testBtn.textContent = 'Test in progress';
        let phrase = phrases[0];
        phrase = phrase.toLowerCase();
        let grammar = '#JSGF V1.0; grammar phrase; public <phrase> = ' + phrase + ';';
        let recognition = new speechRecognition();
        let speechRecognitionList = new speechGrammarList();
        speechRecognitionList.addFromString(grammar, 1);
        recognition.grammars = speechRecognitionList;
        recognition.lang = 'ru-RU';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();

        recognition.onresult = function (event) {
            let speechResult = event.results[0][0].transcript.toLowerCase();
            counterWorker.postMessage(speechResult);
            try {
                setTimeout(() => {
                    recognition.start();
                }, 300);
            } catch (e) {
                console.warn(e);
            }

            console.log('Confidence: ' + event.results[0][0].confidence);
            console.log(speechResult);
        };

        counterWorker.onmessage = function (e) {
            if( "number" === typeof e.data.count
                &&  "number" === typeof e.data.all_count) {
                const obj = e.data;
                count.textContent = count_time;
                const time_per = performance.now();
                const period = (time_per - time_start) / 1000;
                count_time.textContent = obj / period;
                let d = new Date();
                timeline.push(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds());
                countWhat.push(obj.count);
                allWhat[0] += obj.count;
                allWord[0] += obj.all_count;
                console.log("All what " + allWhat);
                console.log("All word " + allWord);
                window.myLine.update();
                window.myDoughnut.update();
            }
        };


        recognition.onspeechend = function () {
            recognition.stop();
            testBtn.disabled = false;
            testBtn.textContent = 'Start new test';
        }

        recognition.onerror = function (event) {
            testBtn.disabled = false;
            testBtn.textContent = 'Start new test';
        }

        recognition.onaudiostart = function (event) {
            console.log('SpeechRecognition.onaudiostart');
        }

        recognition.onaudioend = function (event) {
            console.log('SpeechRecognition.onaudioend');
        }

        recognition.onend = function (event) {
            console.log('SpeechRecognition.onend');
        }

        recognition.onnomatch = function (event) {
            console.log('SpeechRecognition.onnomatch');
        }

        recognition.onsoundstart = function (event) {
            console.log('SpeechRecognition.onsoundstart');
        }

        recognition.onsoundend = function (event) {
            console.log('SpeechRecognition.onsoundend');
        }

        recognition.onspeechstart = function (event) {
            console.log('SpeechRecognition.onspeechstart');
        }
        recognition.onstart = function (event) {
            console.log('SpeechRecognition.onstart');
        }
    }

    testBtn.addEventListener('click', testSpeech);


};
