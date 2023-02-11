from scipy import interpolate
import pandas as pd
import numpy as np
from flask import Flask, request, redirect, send_file, render_template, send_from_directory
import requests, io
from flask_cors import CORS
app = Flask(__name__, static_url_path='/myfilter', template_folder='./myfilter_frontend', static_folder='./myfilter_frontend')
CORS(app)


def combine_filter(urls):
    filter = {band: pd.read_csv(urls[band], header=None, delim_whitespace=True, names=['w', 't'], comment='#').apply(
        pd.to_numeric, errors='ignore') for band in urls}

    filter_interpolate = {}
    _wavelength = []
    for filname in filter:
        w = filter[filname]['w']
        _wavelength = _wavelength + list(w)
        t = filter[filname]['t']
        f = interpolate.interp1d(w, t, kind='slinear',
                                 bounds_error=False, fill_value=0)
        filter_interpolate[filname] = f
    wmin, wmax = min(_wavelength), max(_wavelength)
    step = (wmax+wmin)/2000
    final_t = {'w': np.arange(wmin, wmax+step, step=step)}
    for filname in filter_interpolate:
        fil_interpolate = filter_interpolate[filname]
        final_t[filname] = fil_interpolate(final_t['w'])
    final = pd.DataFrame(final_t)
    return final.to_csv(index=None)


@app.route('/getfilter', methods=['GET'])
def get_filter():
    urls = {fil: "./filters/"+fil+'.dat' for fil in request.args}

    file = combine_filter(urls)
    proxy = io.StringIO(file)
    mem = io.BytesIO()
    mem.write(proxy.getvalue().encode())
    mem.seek(0)
    proxy.close()
    return send_file(mem, mimetype='text/csv')

@app.route('/myfilter', methods=['GET'])
def index():
    return render_template('index.html')

if __name__ == "__main__":
    from waitress import serve
    # serve(app, host="0.0.0.0", port=3688)
    app.run(debug=True, port=9899)