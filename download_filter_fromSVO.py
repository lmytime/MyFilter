# -*- encoding: utf-8 -*-
'''
@File    :   getfilter.py
@Time    :   2022/07/22
@Author  :   Mingyu Li
@Contact :   lmytime@hotmail.com
'''


import os
import re

import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

header = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'}
Cookie = {'Cookie': '_T_WM=75205397376; XSRF-TOKEN=4fc9e7; WEIBOCN_FROM=1110006030; MLOGIN=0; M_WEIBOCN_PARAMS=fid%3D1076032803301701%26uicode%3D10000011'}

r = requests.get('http://svo2.cab.inta-csic.es/theory/fps/index.php',
                 headers=header, cookies=Cookie, verify=False)
r.encoding = r.apparent_encoding
bsoj = BeautifulSoup(r.content, 'lxml', from_encoding=r.encoding)

namelist = bsoj.findAll("a", {"onmouseout": "UnTip()"})
telescope = [name.text for name in namelist][1:]

for tel in tqdm(telescope):
    print(tel)
    url = f"http://svo2.cab.inta-csic.es/theory/fps/index.php?gname={tel}"
    r = requests.get(url, headers=header, cookies=Cookie, verify=False)
    r.encoding = r.apparent_encoding
    bsoj = BeautifulSoup(r.content, 'lxml', from_encoding=r.encoding)
    namelist = bsoj.findAll("a", {"onmouseout": "UnTip()"}, "href")
    instrument = [name.text for name in namelist][202: -12]
    if(len(instrument) == 0):
        instrument.append("")
    print(instrument)
    for ins in instrument:
        url = f"http://svo2.cab.inta-csic.es/theory/fps/index.php?gname={tel}&gname2={ins}"
        r = requests.get(url, headers=header, cookies=Cookie, verify=False)
        r.encoding = r.apparent_encoding
        bsoj = BeautifulSoup(r.content, 'lxml', from_encoding=r.encoding)
        namelist = bsoj.findAll(
            "td", "filfld", string=re.compile(f"{tel}/[\S].[\S]"))
        fils = [name.text for name in namelist if not ' ' in name.text]

        for fil in fils:
            print(fil)
            url = f"http://svo2.cab.inta-csic.es/theory/fps/getdata.php?format=ascii&id={fil}"
            r = requests.get(url, allow_redirects=True,
                             headers=header, cookies=Cookie, verify=False)
            os.makedirs(f"filters/{tel}", exist_ok=True)
            with open(f"filters/{fil}.dat", 'wb') as f:
                f.write(r.content)
    # Remove the last line of the file, to download all files
    break