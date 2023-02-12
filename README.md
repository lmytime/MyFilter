# MyFilter

This web app provides interactive visualization of astronomical filters' transmission curves.

App link: https://preview.lmytime.com/myfilter



## Notes

`getfilter.py`: Download response files of filters are mostly from the [SVO](http://svo2.cab.inta-csic.es/theory/fps/index.php) website.

`fixBugs.py`: Euclid/NISP has different data formats. Here delete them to fix indexing bugs.

`indexing.ipynb`: Generate `indexing.json` file as a reference file.

`run.py`: Run MyFilter app.



#### Filters not in SVO

Some filters are not in SVO.

`JWST_xxx`: xxx represents MIRI, NIRISS, NIRCam, and NIRSpec. These data are from JWST ETC v2.0.

`DECam-Merian`: Filters designed in [Merian Survey](https://merian.sites.ucsc.edu/).

Welcome to provide more filters that are not in SVO.
