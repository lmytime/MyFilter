import allLines from "../lines/llist_v1.3.json" assert {
    type: "json"
};
import FilterIndexing from "../filters/indexing.json" assert {
    type: "json"
};

const app = Vue.createApp({
    data() {
        return {
            g: "",
            redshift: 0,
            lines: "",
            FilterIndexing: FilterIndexing,
            selectedIntrument:[],
            filter: "",
            filterInit: [],
            zInit: 2,
            dialogFormVisible: false,
            form: {
                name: "",
                lambda: "",
                checked: true
            },
            loading: false,
            linList: allLines,
            lineOptions: [],
            instrumentOptions: [],
            instrumentInit: [],
            value: "",
            InstrumentValue: ""
        }
    },
    methods: {
        //
        // Helper function used by underlaycallback.
        //
        getLeftRight(centerWave, g) {
            let center = g.toDomCoords(centerWave, 0);
            return [center[0] - 1.5, center[0] + 1.5];
        },
        //
        // This function draws the spectra line markers.
        //
        underlaycallback(canvas, area, g) {
            g.redshift < -0.1 ? g.redshift = -0.1 : this.redshift = g.redshift
            for (let i = 0; i < this.lines.length; i++) {
                if (this.lines[i].checked === false) continue;
                let shiftedWave = this.lines[i].lambda * (1.0 + g.redshift);
                let leftright = this.getLeftRight(shiftedWave, g);
                canvas.fillStyle = "rgba(0, 38, 220, 0.6)"
                canvas.fillRect(leftright[0], area.y, leftright[1] - leftright[0], area.h);
                canvas.font = "15px serif";
                canvas.fillStyle = "rgba(0, 38, 220, 1)"
                let offset = (i % 3) * 15 + 32;
                let texty = area.y + offset;
                // let texty = lines[i].emission ? area.y + offset : area.y + area.h - offset;
                canvas.fillText(this.lines[i].name, leftright[0], texty);
            }
        },
        updateline() {
            this.g.redshift = this.redshift
            this.g.updateOptions({});
        },
        addLine() {
            this.lines.push(this.form);
            this.form = {
                name: "",
                lambda: "",
                checked: true
            };
            this.g.updateOptions({});
        },
        updateFilter() {
            this.filter = []
            for (let instrument of this.selectedIntrument) {
                for (let ff of instrument.children) {
                    if (ff.checked) {
                        this.filter.push(ff.value)
                    }
                }
            }
            if (this.filter.length === 0) {
                for (let fil of this.filterInit) {
                    this.filter.push(fil + '.dat')
                }
            }
            this.g.updateOptions({
                'file': `https://preview.lmytime.com/getfilter?${this.filter.join('&')}`
            });
        },
        searchLine(query) {
            if (query) {
                this.loading = true
                this.lineOptions = this.linList.filter((item) => {
                    return (item.name+"|"+item.w).toLowerCase().includes(query.replace(/\s/g, '').toLowerCase())
                })
                this.loading = false
            } else {
                this.lineOptions = []
            }
        },
        addSearchedLine(value) {
            this.lines.unshift({
                "name": value.name,
                "lambda": value.w,
                "checked": true
            })
            this.g.updateOptions({});
            this.value = ""
        },
        searchInstrument(query) {
            if (query) {
                this.loading = true
                this.instrumentOptions = this.FilterIndexing.filter((item) => {
                    return (item.value).toLowerCase().includes(query.replace(/\s/g, '').toLowerCase())
                })
                this.loading = false
            } else {
                this.instrumentOptions = []
            }
        },
        addSearchedInstrument(value) {
            this.selectedIntrument.push(value)
            this.InstrumentValue = ""
        },
        getSelectedFilterNumber(childen){
            let count = 0
            for (let ff of childen) {
                if (ff.checked) {
                    count++
                }
            }
            return count
        },
        deleteSelectedInstrument(instrument){
            // all filter set to unchecked
            for (let ff of instrument.children) {
                ff.checked = false
            }
            this.updateFilter()
            // delete instrument
            this.selectedIntrument.splice(this.selectedIntrument.indexOf(instrument), 1)
            instrument.dialog = true
        }
    },
    beforeMount() {
        const params = new URLSearchParams(window.location.search);
        const paramsObj = Array.from(params.keys()).reduce(
            (acc, val) => ({ ...acc, [val]: params.get(val) }),
            {}
        );
        this.filterInit = paramsObj.filter ? paramsObj.filter.split(',') : ["CFHT/MegaCam.u", "Subaru/HSC.g", "Subaru/HSC.r", "Subaru/HSC.i", "Subaru/HSC.z", "Subaru/HSC.Y"]
        this.zInit = paramsObj.z ? parseFloat(paramsObj.z) : 2
        console.log(this.filterInit, this.zInit)
        axios.get("/myfilter/lines/default.json").then(res => {
            this.lines = res.data;
        }).catch(err => {
            console.log(err);
        }).finally(() => {
            this.updateFilter();
        }
        )
    },
    mounted() {
        let legendFormatter = function (data) {
            let g = data.dygraph;

            if (g.getOption('showLabelsOnHighlight') !== true) return '';

            let sepLines = g.getOption('labelsSeparateLines');
            let html;

            if (typeof (data.x) === 'undefined') {
                if (g.getOption('legend') != 'always') {
                    return '';
                }
                html = '';
                for (let i = 0; i < data.series.length; i++) {
                    let series = data.series[i];
                    if (!series.isVisible) continue;
                    if (html !== '') html += (sepLines ? '<br/>' : ' ');
                    html += `<span style='font-weight: bold; color: ${series.color};'>${series.dashHTML} ${series.labelHTML}</span>`;
                }
                return html;
            }
            html = 'Wavelength:' + data.xHTML + 'Å';
            for (let i = 0; i < data.series.length; i++) {
                let series = data.series[i];
                if (!series.isVisible) continue;
                if (sepLines) html += '<br>';
                let cls = series.isHighlighted ? ' class="highlight"' : '';
                html += `<span${cls}> <b><span style='color: ${series.color};'>${series.labelHTML}</span></b>:&#160;${series.yHTML}</span>`;
            }
            return html;
        };

        this.g = new Dygraph(document.getElementById("dygraph"),
            `https://preview.lmytime.com/getfilter?${this.filterInit.join('.dat&')+'.dat'}`, {
                title: 'My Filter',
                xlabel: 'Wavelength [Å]',
                ylabel: 'Response',
                legend: 'always',
                fillGraph: true,
                rollPeriod: 1,
                animatedZooms: true,
                interactionModel: Dygraph.MyInteractionModel,
                underlayCallback: this.underlaycallback,
                labelsShowZeroValues: false,
                labelsSeparateLines: true,
                legendFormatter: legendFormatter,
            });


        for (let fil of this.filterInit) {
            let instrument = this.FilterIndexing.find(item => item.value === fil.split('.')[0])
            this.instrumentInit.push(instrument)
            let filter = instrument.children.find(item => item.value === fil+'.dat')
            filter.checked = true
        }
        this.instrumentInit = this.instrumentInit.filter((v, i, a) => a.indexOf(v) === i);
        this.selectedIntrument = [...this.instrumentInit]
        this.updateFilter()
        this.g.redshift = this.zInit
    }
})

app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
app.mount('#app')