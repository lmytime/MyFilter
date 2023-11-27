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
            cusComment: "",
            defaultLines: "",
            FilterIndexing: FilterIndexing,
            selectedIntrument: [],
            filter: [],
            filterInit: [],
            filterInitDefault: ["CFHT/MegaCam.u", "Subaru/HSC.g", "Subaru/HSC.r", "Subaru/HSC.i", "Subaru/HSC.z", "Subaru/HSC.Y"],
            zInit: 2,
            zInitDefault: 2,
            title: "",
            dialogFormVisible: false,
            form: {
                name: "",
                lambda: "",
                checked: true
            },
            loading: false,
            linList: allLines,
            lineOptions: [],
            readmeDialog: true,
            instrumentOptions: [],
            instrumentInit: [],
            value: "",
            InstrumentValue: "",
            filterLink: "",
            shareLinkVisible: false
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
                        this.filter.push(ff.value.slice(0, -4))
                    }
                }
            }
            if (this.filter.length === 0) {
                this.filter = this.filterInit
            }
            this.filterLink = `/getfilter?${this.filter.join('&')}`
            this.g.updateOptions({
                'file': this.filterLink
            });
        },
        searchLine(query) {
            if (query) {
                this.loading = true
                this.lineOptions = this.linList.filter((item) => {
                    return (item.name + "|" + item.w).toLowerCase().includes(query.replace(/\s/g, '').toLowerCase())
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
        getSelectedFilterNumber(childen) {
            let count = 0
            for (let ff of childen) {
                if (ff.checked) {
                    count++
                }
            }
            return count
        },
        deleteSelectedInstrument(instrument) {
            // all filter set to unchecked
            for (let ff of instrument.children) {
                ff.checked = false
            }
            this.updateFilter()
            // delete instrument
            this.selectedIntrument.splice(this.selectedIntrument.indexOf(instrument), 1)
            instrument.dialog = true
        },
        forceFileDownload(response, title) {
            console.log(title)
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', title)
            document.body.appendChild(link)
            link.click()
        },
        downloadWithAxios(url, title) {
            axios({
                method: 'get',
                url,
                responseType: 'arraybuffer',
            }).then((response) => {
                this.forceFileDownload(response, title)
            }).catch(() => console.log('error occured'))
        },
        copyText() {
            this.shareLinkVisible = true
            navigator.clipboard.writeText(this.shareLink).then(() => {
                setTimeout(() => {
                    this.shareLinkVisible = false
                }, 4000)
            })
            const CopyNotification = () => {
                ElementPlus.ElNotification({
                    title: 'Link copied to clipboard!',
                    type: 'success',
                    duration: 4000,
                })
            }
            CopyNotification();
        },
        selectAllLines() {
            for (let line of this.lines) {
                line.checked = true
            }
            this.g.updateOptions({});
        },
        unselectAllLines() {
            for (let line of this.lines) {
                line.checked = false
            }
            this.g.updateOptions({});
        },
        selectDefaultLines() {
            axios.get("/myfilter/lines/default.json").then(res => {
                this.lines = res.data;
                this.defaultLines = Object.assign({}, res.data);
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                this.g.updateOptions({});
            }
            )
        }
    },
    beforeMount() {
        console.log("Welcome to AstroMy Filter!");
        console.log("If you have any ideas or suggestions, please contact Mingyu at lmytime@hotmail.com");
        console.log("If you like this app, please share it with your friends!");
        console.log("TODO: [1] better line systems; [2] better performance; [3] custom filter; [4] better everything.")

        const params = new URLSearchParams(window.location.search);
        const paramsObj = Array.from(params.keys()).reduce(
            (acc, val) => ({ ...acc, [val]: params.get(val) }),
            {}
        );
        this.cus = paramsObj.cus ? paramsObj.cus : this.cusDefault

        if (this.cus == 'JWST') {
            this.title = this.cus + " Filter";
            this.cusComment = "This is " + this.cus + " customamized version.<br>Go to general version <a target='_blank' href='/myfilter'>here</a>."
            this.filterInitDefault = ["JWST/NIRCam.F090W", "JWST/NIRCam.F115W", "JWST/NIRCam.F150W", "JWST/NIRCam.F200W",
                "JWST/NIRCam.F277W", "JWST/NIRCam.F356W", "JWST/NIRCam.F444W"]
            this.zInitDefault = 6.0
        }

        this.filterInit = paramsObj.fil ? paramsObj.fil.split(',') : this.filterInitDefault
        this.zInit = paramsObj.z ? parseFloat(paramsObj.z) : this.zInitDefault

        const CustomInitNotification = () => {
            ElementPlus.ElNotification({
                title: 'Custom Initialization Success',
                dangerouslyUseHTMLString: true,
                message: `<strong><i>MyFilter</i> app is successfully initialized with the custom-selected filters and redshift.
              You can share the link with others to show the same filter set and redshift.</strong>`,
                type: 'success',
            })
        }


        if ((this.filterInit == this.filterInitDefault) && (this.zInit == this.zInitDefault)) {
            this.shareLinkVisible = false
        } else {
            this.shareLinkVisible = true
            CustomInitNotification()
        }
        axios.get("/myfilter/lines/default.json").then(res => {
            this.lines = res.data;
            this.defaultLines = Object.assign({}, res.data);
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
            html = 'Wavelength: ' + (Math.round(data.x * 100) / 100).toFixed(2) + 'Å';
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
            `/getfilter?${this.filterInit.join('&')}`, {
            title: this.title,
            xlabel: 'Wavelength [Å]',
            ylabel: 'Transmittance',
            legend: 'always',
            fillGraph: true,
            rollPeriod: 1,
            animatedZooms: true,
            interactionModel: Dygraph.MyInteractionModel,
            underlayCallback: this.underlaycallback,
            labelsShowZeroValues: false,
            labelsSeparateLines: true,
            legendFormatter: legendFormatter,
            axisTickSize: 5,
            axisLineWidth: 2,
            strokeWidth: 2,
            fillAlpha: 0.3
        });


        for (let fil of this.filterInit) {
            let instrument = this.FilterIndexing.find(item => item.value === fil.split('.')[0])
            this.instrumentInit.push(instrument)
            let filter = instrument.children.find(item => item.value === fil + '.dat')
            filter.checked = true
        }
        this.instrumentInit = this.instrumentInit.filter((v, i, a) => a.indexOf(v) === i);
        this.selectedIntrument = [...this.instrumentInit]
        this.updateFilter()
        this.g.redshift = this.zInit
    },
    computed: {
        shareLink: function () {
            return `https://preview.lmytime.com/myfilter?fil=${this.filter.join(',')}&z=${this.redshift}`
        }
    }
})

app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.mount('#app')