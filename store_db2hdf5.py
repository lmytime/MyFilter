# %% -*- encoding: utf-8 -*-
'''
@File    :   store_db2hdf5.py
@Time    :   2023/11/27
@Author  :   Mingyu Li
@Contact :   lmytime@hotmail.com
'''

# %%
import os
import h5py
import pandas as pd
from glob import glob
from tqdm import tqdm
from pyphot import Filter

# Get all instrument names
instruments = sorted(os.listdir("filters"))

# Write to hdf5
with h5py.File("db_filter.hdf5", "w") as f:
    for instrument in tqdm(instruments):
        f.create_group(instrument)
        files = glob("filters/"+instrument+"/*.dat")
        for file in files:
            band = file.split("/")[-1][:-4]
            df = pd.read_csv(file, header=None, delim_whitespace=True, names=['wavelength', 'transmission'], comment='#').apply(pd.to_numeric, errors='ignore')
            f[instrument].create_dataset(band, data=df)
            fil = Filter(df['wavelength'], df['transmission'], name=band, dtype='photon', unit='Angstrom')
            f[instrument][band].attrs['w_pivot'] = fil.lpivot.value
            f[instrument][band].attrs['w_min'] = fil.lmin
            f[instrument][band].attrs['w_max'] = fil.lmax
            f[instrument][band].attrs['w_width'] = fil.width.value
# %%
