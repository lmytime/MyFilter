# MyFilter
MyFilter is a web app that provides interactive visualization of astronomical filters' transmission curves.

## Demo
A live demo of the app can be viewed here:

https://preview.lmytime.com/myfilter

<img src="demo.png" width="100%">

## Features
- Interactive transmission curves for common astronomical filters
- Overlay multiple filters for comparison
- Zoom in on specific wavelength ranges
- Check emission or absoption lines for any redshift

## Usage
The app is simple to use. Just select the filters you want to visualize from the sidebar. Hover over the graph for more details and use the mouse to zoom in on areas of interest.

Multiple filters can be overlaid to compare bandpasses.

## Deployment
We provide a way to deploy using docker.

## Development
The app is built using:

Vue.js
drgaphjs for data visualization
Element UI for styling
The filter data is from the [SVO](http://svo2.cab.inta-csic.es/theory/fps/index.php) website.
Some data from users:
- `JWST_xxx`: xxx represents MIRI, NIRISS, NIRCam, and NIRSpec. These data are from JWST ETC v2.0.
- `DECam-Merian`: Filters designed in [Merian Survey](https://merian.sites.ucsc.edu/).
- `MOIRCS`: Subaru MOIRCS

## Contributing
Contributions are welcome! Please create an issue or open a pull request if you would like to add a feature or fix a bug.

## License
This project is open source and available under the MIT License.
