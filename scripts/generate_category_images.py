import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageOps

os.makedirs('public/vittal', exist_ok=True)

def create_studio_bg(size=(800, 800), glow_pos=(0.5, 0.45), glow_color=(212, 175, 55), glow_radius=0.55, glow_strength=0.25):
    w, h = size
    y, x = np.ogrid[:h, :w]
    cx, cy = glow_pos[0] * w, glow_pos[1] * h
    dist = np.sqrt(((x - cx) / w)**2 + ((y - cy) / h)**2)
    
    # Base dark gradient (from #1A1A1E at center to #070709 at borders)
    base_val = np.clip(26 - (dist * 22), 6, 28)
    r = base_val + (glow_color[0] / 255.0) * glow_strength * np.maximum(0, 1 - dist / glow_radius) * 65
    g = base_val + (glow_color[1] / 255.0) * glow_strength * np.maximum(0, 1 - dist / glow_radius) * 65
    b = base_val + (glow_color[2] / 255.0) * glow_strength * np.maximum(0, 1 - dist / glow_radius) * 65
    
    # Add subtle bottom vignette
    bottom_vig = np.clip((y - (h * 0.7)) / (h * 0.3), 0, 1) * 8
    r = np.clip(r - bottom_vig, 0, 255)
    g = np.clip(g - bottom_vig, 0, 255)
    b = np.clip(b - bottom_vig, 0, 255)
    
    rgb = np.dstack([r, g, b]).astype(np.uint8)
    return Image.fromarray(rgb)

def add_contact_shadow(canvas_size, center_x, bottom_y, width, height, blur=24, alpha=220):
    shadow = Image.new('RGBA', canvas_size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.ellipse([
        center_x - width // 2,
        bottom_y - height // 2,
        center_x + width // 2,
        bottom_y + height // 2
    ], fill=(0, 0, 0, alpha))
    return shadow.filter(ImageFilter.GaussianBlur(blur))

# ============================================================================
# 1. GYM SUPPLEMENTS
# ============================================================================
print("Processing 1/5: Gym Supplements...")
bg1 = create_studio_bg((800, 800), glow_pos=(0.5, 0.42), glow_strength=0.28)
tub = Image.open('public/vittal/product-whey-protein-jar.png').convert('RGBA')
tub.thumbnail((620, 620), Image.Resampling.LANCZOS)
tw, th = tub.size

shadow1 = add_contact_shadow((800, 800), 400, 400 + th // 2 - 15, int(tw * 0.85), 55, blur=25)
c1 = Image.alpha_composite(bg1.convert('RGBA'), shadow1)
c1.paste(tub, (400 - tw // 2, 400 - th // 2 - 15), tub)
c1.convert('RGB').save('public/vittal/cat-gym-supplements.png', 'PNG', quality=95)

# ============================================================================
# 2. OUTFITS (Fitness Model in Black Performance Activewear)
# ============================================================================
print("Processing 2/5: Outfits...")
hero = Image.open('public/vittal/hero-fitness-gold.png')
# Crop athletic muscular model
hw, hh = hero.size
crop_outfit = hero.crop((int(hw * 0.52), 20, int(hw * 0.98), hh - 20))
# Resize to fit 800x800 square with dark studio vignette
crop_outfit = crop_outfit.resize((700, int(700 * (crop_outfit.size[1] / crop_outfit.size[0]))), Image.Resampling.LANCZOS)
# Place on 800x800 studio dark background
bg2 = create_studio_bg((800, 800), glow_pos=(0.5, 0.45), glow_strength=0.22)
cw, ch = crop_outfit.size
# crop to 800x800 center
crop_top = max(0, (ch - 800) // 3)
crop_outfit_sq = crop_outfit.crop((0, crop_top, min(cw, 800), min(ch, crop_top + 800)))
# Center on canvas
c2 = bg2.copy()
ox = (800 - crop_outfit_sq.size[0]) // 2
oy = (800 - crop_outfit_sq.size[1]) // 2
c2.paste(crop_outfit_sq, (ox, oy))

# Apply dark vignette to blend borders perfectly
vig = Image.new('L', (800, 800), 0)
d_vig = ImageDraw.Draw(vig)
d_vig.rectangle([40, 40, 760, 760], fill=255)
vig = vig.filter(ImageFilter.GaussianBlur(50))
black_layer = Image.new('RGB', (800, 800), (9, 9, 11))
c2 = Image.composite(c2, black_layer, vig)
c2.save('public/vittal/cat-outfits.png', 'PNG', quality=95)

# ============================================================================
# 3. APPARELS (Heavyweight Oversized Black T-Shirt with VL Branding)
# ============================================================================
print("Processing 3/5: Apparels...")
bg3 = create_studio_bg((800, 800), glow_pos=(0.5, 0.42), glow_strength=0.25)
tee = Image.open('public/vittal/product-tshirt-black.png').convert('RGBA')
tee.thumbnail((640, 640), Image.Resampling.LANCZOS)
tew, teh = tee.size

shadow3 = add_contact_shadow((800, 800), 400, 400 + teh // 2 - 25, int(tew * 0.75), 50, blur=28)
c3 = Image.alpha_composite(bg3.convert('RGBA'), shadow3)
c3.paste(tee, (400 - tew // 2, 400 - teh // 2 - 20), tee)
c3.convert('RGB').save('public/vittal/cat-apparels.png', 'PNG', quality=95)

# ============================================================================
# 4. DATES & NUTS (Royal Ajwa Dates in Luxury Dark Bowl)
# ============================================================================
print("Processing 4/5: Dates & Nuts...")
bg4 = create_studio_bg((800, 800), glow_pos=(0.5, 0.45), glow_strength=0.26)
dates = Image.open('public/vittal/product-glossy-dates.png').convert('RGBA')
dates.thumbnail((620, 620), Image.Resampling.LANCZOS)
dw, dh = dates.size

shadow4 = add_contact_shadow((800, 800), 400, 400 + dh // 2 - 15, int(dw * 0.8), 60, blur=30)
c4 = Image.alpha_composite(bg4.convert('RGBA'), shadow4)
c4.paste(dates, (400 - dw // 2, 400 - dh // 2 - 10), dates)
c4.convert('RGB').save('public/vittal/cat-dates-nuts.png', 'PNG', quality=95)

# ============================================================================
# 5. CANDY & CHOCOLATES (Artisan Dark Gourmet Chocolate on Slate)
# ============================================================================
print("Processing 5/5: Candy & Chocolates...")
bg5 = create_studio_bg((800, 800), glow_pos=(0.5, 0.5), glow_strength=0.24)
choc = Image.open('public/vittal/test-chocolate.jpg').convert('RGB')
# Center crop to square
cw, ch = choc.size
min_dim = min(cw, ch)
choc_sq = choc.crop(((cw - min_dim) // 2, (ch - min_dim) // 2, (cw + min_dim) // 2, (ch + min_dim) // 2))
choc_sq = choc_sq.resize((700, 700), Image.Resampling.LANCZOS)

# Composite on dark studio bg with soft feathered vignette
c5 = bg5.copy()
c5.paste(choc_sq, (50, 50))
vig5 = Image.new('L', (800, 800), 0)
d_vig5 = ImageDraw.Draw(vig5)
d_vig5.rectangle([60, 60, 740, 740], fill=255)
vig5 = vig5.filter(ImageFilter.GaussianBlur(40))
c5 = Image.composite(c5, black_layer, vig5)

# Enhance contrast and richness for moody dark luxury aesthetic
enhancer = ImageEnhance.Contrast(c5)
c5 = enhancer.enhance(1.15)
enhancer_b = ImageEnhance.Brightness(c5)
c5 = enhancer_b.enhance(0.92)
c5.save('public/vittal/cat-candy-chocolates.png', 'PNG', quality=95)
# Also copy to cat-chocolates.png for compatibility
c5.save('public/vittal/cat-chocolates.png', 'PNG', quality=95)

print("All 5 luxury category images generated successfully!")
