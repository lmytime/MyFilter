from scipy import interpolate
import pandas as pd
import numpy as np
from flask import Flask, request, send_file, render_template
import io
from flask_cors import CORS

app = Flask(__name__, static_url_path='/myfilter', template_folder='./myfilter_frontend', static_folder='./myfilter_frontend')
CORS(app)


def combine_filter(bands, precision=2000):
    bands_raw = {band: db_filter[band] for band in bands}

    bands_interpolate = {}
    _wavelength = []
    for band_name, band_data in bands_raw.items():
        w = band_data[:, 0]
        t = band_data[:, 1]
        _wavelength = _wavelength + list(w)
        inp_t = interpolate.interp1d(w, t, kind='slinear',
                                 bounds_error=False, fill_value=0)
        bands_interpolate[band_name] = inp_t

    # prepare final data
    wmin, wmax = min(_wavelength), max(_wavelength)
    step = (wmax+wmin)/precision
    final_wavelength = np.arange(wmin, wmax+step, step=step)
    final_data = {band_name: band_interpolate(final_wavelength) for band_name, band_interpolate in bands_interpolate.items()}
    final_dataframe = pd.DataFrame({'w': final_wavelength, **final_data})

    return final_dataframe.to_csv(index=None)


@app.route('/getfilter', methods=['GET'])
def get_filter():
    file = combine_filter(request.args)

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
    import h5py

    # Read the filter db
    db_filter = h5py.File('db_filter.hdf5', 'r')

    # Run the server
    # serve(app, host="0.0.0.0", port=3688)
    app.run(debug=True, port=9899)