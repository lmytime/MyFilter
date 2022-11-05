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
                this.filter = ["CFHT/MegaCam.u.dat", "Subaru/HSC.g.dat", "Subaru/HSC.r.dat", "Subaru/HSC.i.dat", "Subaru/HSC.z.dat", "Subaru/HSC.Y.dat"]
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
        }
    },
    beforeMount() {
        const params = new URLSearchParams(window.location.search);
        const paramsObj = Array.from(params.keys()).reduce(
            (acc, val) => ({ ...acc, [val]: params.get(val) }),
            {}
        );
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
        this.g = new Dygraph(document.getElementById("dygraph"),
            `https://preview.lmytime.com/getfilter?CFHT/MegaCam.u.dat&Subaru/HSC.g.dat&Subaru/HSC.r.dat&Subaru/HSC.i.dat&Subaru/HSC.z.dat&Subaru/HSC.Y.dat`, {
                title: 'My Filter',
                xlabel: 'Wavelength [Å]',
                ylabel: 'Response',
                legend: 'follow',
                fillGraph: true,
                rollPeriod: 1,
                animatedZooms: true,
                interactionModel: Dygraph.MyInteractionModel,
                underlayCallback: this.underlaycallback,
            });

        // initialize using Subaru/HSC g, r, i, z, Y filters and CFHT/MegaCam u filter
        this.selectedIntrument = [this.FilterIndexing[393], this.FilterIndexing[159]]
        this.selectedIntrument[0]['children'][3]['checked'] = true
        this.selectedIntrument[0]['children'][8]['checked'] = true
        this.selectedIntrument[0]['children'][12]['checked'] = true
        this.selectedIntrument[0]['children'][15]['checked'] = true
        this.selectedIntrument[0]['children'][21]['checked'] = true
        this.selectedIntrument[1]['children'][0]['checked'] = true

        this.updateFilter()
        this.g.redshift = 2.3
    }
})

app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
app.mount('#app')