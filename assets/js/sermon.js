class Sermon {
    constructor(time, lead) {
        this.time = time;
        this.lead = lead;
    }
    toString() {
        return `${this.time}, "${this.lead}"`;
    }
    toStorage() {
        return {
            time: this.time,
            lead: this.lead,
        };
    }
}
class SermonCalculator {
    constructor() {
        this.storedSermons = [];
        this.sermonText = 'Example';
        this.wpm = 130;
        this.number = this.storedSermons.length + 1;
        this.minutes = function () {
            let words = this.sermonText
                .replace(/[^\w\s]|_/g, '')
                .replace(/\s+/g, ' ')
                .toLowerCase()
                .match(/\S+/g) || [];
            return Math.round(words.length / this.wpm);
        };
        this.average = function () {
            return Math.round((this.minutes() + this.storedSermons.reduce((p, c) => p + c.time, 0)) / (this.number - (this.minutes() === 0 ? 1 : 0))) || 0;
        };
        this.saveSermon = function () {
            this.storedSermons.push(new Sermon(this.minutes(), `${this.sermonText.substring(0, 10)}....`));
            localStorage.setItem("storedSermons", JSON.stringify(this.storedSermons.map(v => v.toStorage())));
            localStorage.setItem("wpm", this.wpm.toString());
        };
        this.clearData = function () {
            this.storedSermons = [];
            localStorage.setItem("storedSermons", JSON.stringify([]));
        };
        var sermons = JSON.parse(localStorage.getItem("storedSermons")) || [];
        this.storedSermons = sermons.map(v => new Sermon(v.time, v.lead));
        this.wpm = parseInt(localStorage.getItem("wpm")) || 130;
    }
}
window.addEventListener('load', function (_ev) {
    const calc = new SermonCalculator();
    this.sermonCalc = calc;
    const sermonText = document.getElementById('sermon-text');
    const sermonMinutes = document.getElementById('sermon-minutes');
    const sermonAverage = document.getElementById('sermon-average');
    const wpm = document.getElementById('sermon-wpm');
    const save = document.getElementById('save-sermon');
    const clear = document.getElementById('clear-sermons');
    const list = document.getElementById('sermonTimingList');
    sermonText.addEventListener('input', function (ev) {
        calc.sermonText = this.value;
        let min = calc.minutes();
        sermonMinutes.textContent = min.toFixed(0);
        sermonAverage.textContent = calc.average().toFixed(0);
    });
    wpm.addEventListener('change', function (ev) {
        calc.wpm = Number.parseFloat(wpm.value);
        if (Number.isNaN(calc.wpm)) {
            calc.wpm = 0;
        }
        let min = calc.minutes();
        sermonMinutes.textContent = min.toFixed(0);
        sermonAverage.textContent = calc.average().toFixed(0);
    });
    save.addEventListener('click', function (ev) {
        calc.saveSermon();
        sermonAverage.textContent = calc.average().toFixed(0);
    });
    clear.addEventListener('click', function (ev) {
        calc.clearData();
        sermonAverage.textContent = calc.average().toFixed(0);
    });
    for (let i = 0; i < calc.storedSermons.length; i++) {
        let li = new HTMLLIElement();
        li.innerText = calc.storedSermons.toString();
        list.appendChild(li);
    }
});
