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
import numpy as np
from glob import glob
from tqdm import tqdm
from pyphot import Filter

# Get all instrument names
telescopes = sorted(os.listdir("filters"))
# instruments = sorted(os.listdir("filters"))

# Write to hdf5
with h5py.File("db_filter.hdf5", "w") as f:
    for telescope in tqdm(telescopes):
        f.create_group(telescope)
        all_files = glob("filters/"+telescope+"/*.dat")
        instruments = np.unique([file.split("/")[-1].split('.')[0] for file in all_files])
        for instrument in instruments:
            f[telescope].create_group(instrument)
            inst_files = glob("filters/"+telescope+"/"+instrument+"*.dat")
            for file in inst_files:
                band = file.split("/")[-1][:-4]
                df = pd.read_csv(file, header=None, delim_whitespace=True, names=['wavelength', 'transmission'], comment='#').apply(pd.to_numeric, errors='ignore')
                f[telescope][instrument].create_dataset(band, data=df)
                fil = Filter(df['wavelength'], df['transmission'], name=band, dtype='photon', unit='Angstrom')
                f[telescope][instrument][band].attrs['w_pivot'] = fil.lpivot.value
                f[telescope][instrument][band].attrs['w_min'] = fil.lmin
                f[telescope][instrument][band].attrs['w_max'] = fil.lmax
                f[telescope][instrument][band].attrs['w_width'] = fil.width.value
# %%
