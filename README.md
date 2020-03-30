# node-red-contrib-bitunloader
 Unload numbers to a binary string, array of bits, array of bools, object of bits, or object of bools.

## New!
Use the 'bitreloader' Node to transform your variable back to an integer.
You can also use bitreloader stand-alone by setting `msg._prop` to the property you want to transform and `msg._mode` to tell the node what to expect on the input.

Options are;
- 'string'
- 'arrayBits'
- 'arrayBools'
- 'objectBits'
- 'objectBools'

Without these set, bitreloader will generate an error and pass the message unchanged.


 <a href="https://www.buymeacoffee.com/NxcwUpD" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
