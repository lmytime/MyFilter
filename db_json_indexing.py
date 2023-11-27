# %% -*- encoding: utf-8 -*-
'''
@File    :   db_json_indexing.py
@Time    :   2023/11/27
@Author  :   Mingyu Li
@Contact :   lmytime@hotmail.com
'''

# %%
import h5py
import pandas as pd
from tqdm import tqdm
import json

indexing = []
with h5py.File('db_filter.hdf5', 'r') as f:
    for instrument in tqdm(f.keys()):

        # sorting the bands by wavelength
        bands = list(f[instrument].keys())
        wavelength = [f[instrument][band].attrs['w_pivot'] for band in bands]
        ddff = pd.DataFrame({"w":wavelength, "f":bands})
        ddff.sort_values(by=['w'], inplace=True)
        bands = ddff['f'].values

        # indexing the bands
        indexing.append({
            "value":instrument,
            "label":instrument,
            "dialog":True,
            "children":[{"value":f"{instrument}.{band}", "label":band, "checked":False} for band in bands]})

# Save to json
with open('indexing.json', 'w') as outfile:
    json.dump(indexing, outfile)