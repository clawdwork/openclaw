# Physical Dimensions & Format Specifications

Gemini 3 Pro natively understands physical dimensions. State exact dimensions early in the prompt.

## Supported Formats

| Format        | Example Prompt Phrasing                                                     |
| ------------- | --------------------------------------------------------------------------- |
| **Banners**   | `design for a 6 foot vinyl banner`, `horizontal banner 8ft x 2ft`           |
| **Packaging** | `label for a 2.75 inch aluminum can`, `wrap design for a 12oz bottle`       |
| **Print**     | `poster at 24x36 inches`, `business card 3.5 x 2 inches`                    |
| **Digital**   | `Instagram story 1080x1920`, `YouTube thumbnail 1280x720`                   |
| **Signage**   | `A-frame sidewalk sign 24x36`, `window decal 4ft diameter`                  |
| **Apparel**   | `design for front of t-shirt 12x16 print area`, `hat embroidery 4x2 inches` |

## How the Model Interprets Dimensions

- **Aspect ratio** adjusts automatically (6ft banner = extreme landscape)
- **Text/element scale** proportional to physical size
- **Composition adapts** — narrow can label vs wide banner need different layouts
- **Viewing distance** considered — billboard needs bolder elements than business card

## Tips

- State **exact physical dimensions** early in the prompt
- Mention **material/medium** (vinyl, aluminum, canvas, paper) — affects texture
- Specify **viewing distance** if relevant ("readable from 20 feet")
- For packaging: specify **wrap** (360°) or **flat label**
- Combine with standard prompt elements (lighting, style, color)

## Examples

### Product Packaging

```
Design a product label for a 2.75 inch aluminum energy drink can. Bold
typography, electric blue and neon green color scheme, lightning bolt motif,
clean modern layout. Brand name "VOLT" prominent and readable at arm's length.
Matte black background with metallic accents.
```

### Banner

```
Create a horizontal vinyl banner, 6 feet wide by 2 feet tall, for a grand
opening event. Bold white text on deep navy background reading "NOW OPEN".
Gold accent border. Readable from 20 feet away. Minimalist design with
logo placeholder on the left third.
```

### Social Media

```
Instagram story layout 1080x1920, fashion brand announcement, bold sans-serif
typography, split-screen design with product image on top and text on bottom,
coral and cream color palette, clean minimalist aesthetic.
```

### Print Poster

```
Concert poster at 24x36 inches, psychedelic rock aesthetic, bold hand-lettered
band name, neon colors on dark background, halftone dot pattern texture,
vintage screen-print style, Fuji Velvia 50 color saturation.
```
