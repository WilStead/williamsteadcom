class Sermon {
    time: number;
    lead: string;

    constructor(time: number, lead: string) {
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
interface SermonStorage {
    time: number;
    lead: string;
}

class SermonCalculator {
    storedSermons: Sermon[] = [];

    sermonText = 'Example';

    wpm = 130;

    number = this.storedSermons.length + 1;

    minutes = function (this: SermonCalculator) {
        let words = this.sermonText
            .replace(/[^\w\s]|_/g, '')
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .match(/\S+/g) || [];
        return Math.round(words.length / this.wpm);
    };

    average = function (this: SermonCalculator) {
        return Math.round((this.minutes() + this.storedSermons.reduce((p, c) => p + c.time, 0)) / (this.number - (this.minutes() === 0 ? 1 : 0))) || 0;
    };

    saveSermon = function (this: SermonCalculator) {
        this.storedSermons.push(new Sermon(this.minutes(), `${this.sermonText.substring(0, 10)}....`));
        localStorage.setItem("storedSermons", JSON.stringify(this.storedSermons.map(v => v.toStorage())));
        localStorage.setItem("wpm", this.wpm.toString());
    }

    clearData = function (this: SermonCalculator) {
        this.storedSermons = [];
        localStorage.setItem("storedSermons", JSON.stringify([]));
    }

    constructor() {
        var sermons: SermonStorage[] = JSON.parse(localStorage.getItem("storedSermons")) || [];
        this.storedSermons = sermons.map(v => new Sermon(v.time, v.lead));
        this.wpm = parseInt(localStorage.getItem("wpm")) || 130;
    }
}

window.addEventListener('load', function (this: Window, _ev: Event) {
    const calc = new SermonCalculator();
    (this as any).sermonCalc = calc;

    const sermonText = document.getElementById('sermon-text') as HTMLTextAreaElement;
    const sermonMinutes = document.getElementById('sermon-minutes') as HTMLSpanElement;
    const sermonAverage = document.getElementById('sermon-average') as HTMLSpanElement;
    const wpm = document.getElementById('sermon-wpm') as HTMLInputElement;
    const save = document.getElementById('save-sermon') as HTMLButtonElement;
    const clear = document.getElementById('clear-sermons') as HTMLButtonElement;
    const list = document.getElementById('sermonTimingList') as HTMLUListElement;

    sermonText.addEventListener('input', function (this: HTMLTextAreaElement, ev: Event) {
        calc.sermonText = this.value;
        let min = calc.minutes();
        sermonMinutes.textContent = min.toFixed(0);
        sermonAverage.textContent = calc.average().toFixed(0);
    });

    wpm.addEventListener('change', function (this: HTMLInputElement, ev: Event) {
        calc.wpm = Number.parseFloat(wpm.value);
        if (Number.isNaN(calc.wpm)) {
            calc.wpm = 0;
        }
        let min = calc.minutes();
        sermonMinutes.textContent = min.toFixed(0);
        sermonAverage.textContent = calc.average().toFixed(0);
    });

    save.addEventListener('click', function (this: HTMLButtonElement, ev: Event) {
        calc.saveSermon();
        sermonAverage.textContent = calc.average().toFixed(0);
    });

    clear.addEventListener('click', function (this: HTMLButtonElement, ev: Event) {
        calc.clearData();
        sermonAverage.textContent = calc.average().toFixed(0);
    });

    for (let i = 0; i < calc.storedSermons.length; i++) {
        let li = new HTMLLIElement();
        li.innerText = calc.storedSermons.toString();
        list.appendChild(li);
    }
});