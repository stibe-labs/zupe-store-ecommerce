from PIL import Image
import os

source_path = r"C:\Users\ijas1\Downloads\IMG_7612.PNG"
img = Image.open(source_path)

print(f"Loaded {source_path}, size={img.size}, mode={img.mode}")

# Ensure RGB/RGBA
if img.mode not in ("RGB", "RGBA"):
    img = img.convert("RGBA")

# Generate sizes for ICO
ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
ico_images = [img.resize(s, Image.Resampling.LANCZOS) for s in ico_sizes]

# Save ICO to src/app and public
ico_images[0].save(
    "src/app/favicon.ico",
    format="ICO",
    sizes=ico_sizes,
    append_images=ico_images[1:]
)
ico_images[0].save(
    "public/favicon.ico",
    format="ICO",
    sizes=ico_sizes,
    append_images=ico_images[1:]
)
print("Saved favicon.ico to src/app/ and public/")

# High-res PNGs
img.resize((512, 512), Image.Resampling.LANCZOS).save("src/app/icon.png", format="PNG")
img.resize((512, 512), Image.Resampling.LANCZOS).save("public/icon.png", format="PNG")
img.resize((192, 192), Image.Resampling.LANCZOS).save("public/favicon.png", format="PNG")
img.resize((180, 180), Image.Resampling.LANCZOS).save("public/apple-touch-icon.png", format="PNG")
img.resize((32, 32), Image.Resampling.LANCZOS).save("public/favicon-32x32.png", format="PNG")
img.resize((16, 16), Image.Resampling.LANCZOS).save("public/favicon-16x16.png", format="PNG")

# Overwrite legacy favicon.jpeg
img.convert("RGB").resize((512, 512), Image.Resampling.LANCZOS).save("public/favicon.jpeg", format="JPEG", quality=95)

print("All favicon assets generated successfully!")
