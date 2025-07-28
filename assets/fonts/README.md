# Font Setup Instructions

## EB Garamond Font

To enable high-quality text rendering, download and add the EB Garamond font file:

1. **Download EB Garamond**: 
   - Visit [Google Fonts - EB Garamond](https://fonts.google.com/specimen/EB+Garamond)
   - Click "Download family"
   - Extract the downloaded ZIP file

2. **Add Font File**:
   - Copy `EBGaramond-Regular.ttf` from the extracted folder
   - Place it in this directory: `assets/fonts/EBGaramond-Regular.ttf`

3. **Verify Installation**:
   - The font will be automatically loaded when the server starts
   - Check the console logs for "✅ EB Garamond font loaded successfully"

## Benefits of Embedded Fonts

- **Higher Quality**: OTF fonts render much sharper than web fonts
- **Reliability**: No dependency on external font loading
- **Performance**: Faster rendering without network requests
- **Consistency**: Same font rendering across all environments

## Fallback

If the embedded font is not found, the system will automatically fall back to web fonts. 