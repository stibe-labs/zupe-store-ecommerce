import os
from PIL import Image, ImageEnhance
import numpy as np

def create_color_variant(img, hue_shift_val, sat_mult=1.0, val_mult=1.0, sat_threshold=30):
    hsv = img.convert('HSV')
    h, s, v = hsv.split()
    h_arr = np.array(h, dtype=np.int16)
    s_arr = np.array(s, dtype=np.float32)
    v_arr = np.array(v, dtype=np.float32)

    mask = s_arr > sat_threshold

    if hue_shift_val != 0:
        h_arr[mask] = (h_arr[mask] + hue_shift_val) % 256
    
    if sat_mult != 1.0:
        s_arr[mask] = np.clip(s_arr[mask] * sat_mult, 0, 255)
        
    if val_mult != 1.0:
        v_arr[mask] = np.clip(v_arr[mask] * val_mult, 0, 255)

    new_h = Image.fromarray(h_arr.astype(np.uint8))
    new_s = Image.fromarray(s_arr.astype(np.uint8))
    new_v = Image.fromarray(v_arr.astype(np.uint8))
    new_hsv = Image.merge('HSV', (new_h, new_s, new_v))
    return new_hsv.convert('RGB')

def create_angles(img, angle_specs):
    """
    angle_specs is a list of tuples: (box_or_none, filename)
    where box_or_none is (left_pct, top_pct, right_pct, bottom_pct)
    """
    w, h = img.size
    results = []
    for spec in angle_specs:
        box, filename = spec
        if box is None:
            cropped = img.copy()
        else:
            x1 = int(w * box[0])
            y1 = int(h * box[1])
            x2 = int(w * box[2])
            y2 = int(h * box[3])
            cropped = img.crop((x1, y1, x2, y2)).resize((1024, 1024), Image.Resampling.LANCZOS)
        results.append((cropped, filename))
    return results

def main():
    print("Processing product angles and colors...")

    # 1. Ripple Lamp
    os.makedirs('public/products/ripple', exist_ok=True)
    if os.path.exists('public/products/ripple/ripple-amber.jpg'):
        amber = Image.open('public/products/ripple/ripple-amber.jpg')
        # Angle 2: top crystal facet
        w, h = amber.size
        crop_top = amber.crop((int(w*0.1), int(h*0.1), int(w*0.8), int(h*0.8))).resize((1024, 1024), Image.Resampling.LANCZOS)
        crop_top.save('public/products/ripple/ripple-amber-angle2.jpg', quality=95)
        # Angle 3: wooden base and ambient glow
        crop_base = amber.crop((int(w*0.15), int(h*0.35), int(w*0.95), int(h*0.95))).resize((1024, 1024), Image.Resampling.LANCZOS)
        crop_base.save('public/products/ripple/ripple-amber-angle3.jpg', quality=95)

    for color in ['blue', 'pink', 'purple', 'green', 'white']:
        fn = f'public/products/ripple/ripple-{color}.jpg'
        if os.path.exists(fn):
            c_img = Image.open(fn)
            w, h = c_img.size
            crop2 = c_img.crop((int(w*0.1), int(h*0.1), int(w*0.85), int(h*0.85))).resize((1024, 1024), Image.Resampling.LANCZOS)
            crop2.save(f'public/products/ripple/ripple-{color}-angle2.jpg', quality=95)

    # 2. Nebulizer
    os.makedirs('public/products/nebulizer', exist_ok=True)
    if os.path.exists('public/products/mesh-nebulizer.jpg'):
        neb_base = Image.open('public/products/mesh-nebulizer.jpg')
        w, h = neb_base.size
        crop_chamber = neb_base.crop((int(w*0.2), int(h*0.1), int(w*0.8), int(h*0.7))).resize((1024, 1024), Image.Resampling.LANCZOS)
        crop_chamber.save('public/products/nebulizer/nebulizer-white-3.jpg', quality=95)

        # Sky Blue variant
        neb_blue = create_color_variant(neb_base, 30, sat_mult=1.2, sat_threshold=20)
        neb_blue.save('public/products/nebulizer/nebulizer-blue-1.jpg', quality=95)
        crop_blue = neb_blue.crop((int(w*0.2), int(h*0.1), int(w*0.8), int(h*0.7))).resize((1024, 1024), Image.Resampling.LANCZOS)
        crop_blue.save('public/products/nebulizer/nebulizer-blue-2.jpg', quality=95)

        # Baby Pink variant
        neb_pink = create_color_variant(neb_base, 110, sat_mult=1.1, sat_threshold=20)
        neb_pink.save('public/products/nebulizer/nebulizer-pink-1.jpg', quality=95)
        crop_pink = neb_pink.crop((int(w*0.2), int(h*0.1), int(w*0.8), int(h*0.7))).resize((1024, 1024), Image.Resampling.LANCZOS)
        crop_pink.save('public/products/nebulizer/nebulizer-pink-2.jpg', quality=95)

    # 3. Washer
    os.makedirs('public/products/washer', exist_ok=True)
    if os.path.exists('public/products/foldable-washer.jpg'):
        washer_base = Image.open('public/products/foldable-washer.jpg')
        w, h = washer_base.size
        # Purple angles
        washer_base.save('public/products/washer/washer-purple-1.jpg', quality=95)
        w_top = washer_base.crop((int(w*0.1), int(h*0.05), int(w*0.9), int(h*0.85))).resize((1024, 1024), Image.Resampling.LANCZOS)
        w_top.save('public/products/washer/washer-purple-2.jpg', quality=95)
        w_base = washer_base.crop((int(w*0.15), int(h*0.35), int(w*0.85), int(h*0.95))).resize((1024, 1024), Image.Resampling.LANCZOS)
        w_base.save('public/products/washer/washer-purple-3.jpg', quality=95)

        # Mint Green
        washer_green = create_color_variant(washer_base, 85, sat_mult=1.1, sat_threshold=30)
        washer_green.save('public/products/washer/washer-green-1.jpg', quality=95)
        wg_top = washer_green.crop((int(w*0.1), int(h*0.05), int(w*0.9), int(h*0.85))).resize((1024, 1024), Image.Resampling.LANCZOS)
        wg_top.save('public/products/washer/washer-green-2.jpg', quality=95)
        wg_base = washer_green.crop((int(w*0.15), int(h*0.35), int(w*0.85), int(h*0.95))).resize((1024, 1024), Image.Resampling.LANCZOS)
        wg_base.save('public/products/washer/washer-green-3.jpg', quality=95)

        # Sakura Pink
        washer_pink = create_color_variant(washer_base, 140, sat_mult=1.0, sat_threshold=30)
        washer_pink.save('public/products/washer/washer-pink-1.jpg', quality=95)
        wp_top = washer_pink.crop((int(w*0.1), int(h*0.05), int(w*0.9), int(h*0.85))).resize((1024, 1024), Image.Resampling.LANCZOS)
        wp_top.save('public/products/washer/washer-pink-2.jpg', quality=95)
        wp_base = washer_pink.crop((int(w*0.15), int(h*0.35), int(w*0.85), int(h*0.95))).resize((1024, 1024), Image.Resampling.LANCZOS)
        wp_base.save('public/products/washer/washer-pink-3.jpg', quality=95)

    # 4. Thermal Printer
    os.makedirs('public/products/printer', exist_ok=True)
    if os.path.exists('public/products/thermal-printer.jpg'):
        print_base = Image.open('public/products/thermal-printer.jpg')
        w, h = print_base.size

        # Candy Pink
        print_base.save('public/products/printer/printer-pink-1.jpg', quality=95)
        p_slot = print_base.crop((int(w*0.1), int(h*0.05), int(w*0.9), int(h*0.8))).resize((1024, 1024), Image.Resampling.LANCZOS)
        p_slot.save('public/products/printer/printer-pink-2.jpg', quality=95)
        p_detail = print_base.crop((int(w*0.15), int(h*0.3), int(w*0.85), int(h*0.95))).resize((1024, 1024), Image.Resampling.LANCZOS)
        p_detail.save('public/products/printer/printer-pink-3.jpg', quality=95)

        # Sky Blue
        print_blue = create_color_variant(print_base, 115, sat_mult=1.1, sat_threshold=25)
        print_blue.save('public/products/printer/printer-blue-1.jpg', quality=95)
        pb_slot = print_blue.crop((int(w*0.1), int(h*0.05), int(w*0.9), int(h*0.8))).resize((1024, 1024), Image.Resampling.LANCZOS)
        pb_slot.save('public/products/printer/printer-blue-2.jpg', quality=95)
        pb_detail = print_blue.crop((int(w*0.15), int(h*0.3), int(w*0.85), int(h*0.95))).resize((1024, 1024), Image.Resampling.LANCZOS)
        pb_detail.save('public/products/printer/printer-blue-3.jpg', quality=95)

        # Chalk White
        print_white = create_color_variant(print_base, 0, sat_mult=0.15, val_mult=1.15, sat_threshold=25)
        print_white.save('public/products/printer/printer-white-1.jpg', quality=95)
        pw_slot = print_white.crop((int(w*0.1), int(h*0.05), int(w*0.9), int(h*0.8))).resize((1024, 1024), Image.Resampling.LANCZOS)
        pw_slot.save('public/products/printer/printer-white-2.jpg', quality=95)

    # 5. Helicopter Car Perfume
    os.makedirs('public/products/helicopter', exist_ok=True)
    if os.path.exists('public/products/helicopter-perfume.jpg'):
        heli_base = Image.open('public/products/helicopter-perfume.jpg')
        w, h = heli_base.size

        # Stealth Black & Gold
        heli_base.save('public/products/helicopter/heli-black-1.jpg', quality=95)
        h_prop = heli_base.crop((int(w*0.05), int(h*0.05), int(w*0.95), int(h*0.75))).resize((1024, 1024), Image.Resampling.LANCZOS)
        h_prop.save('public/products/helicopter/heli-black-2.jpg', quality=95)
        h_cockpit = heli_base.crop((int(w*0.15), int(h*0.25), int(w*0.85), int(h*0.9))).resize((1024, 1024), Image.Resampling.LANCZOS)
        h_cockpit.save('public/products/helicopter/heli-black-3.jpg', quality=95)

        # Titanium Silver
        heli_silver = create_color_variant(heli_base, 0, sat_mult=0.2, val_mult=1.25, sat_threshold=20)
        heli_silver.save('public/products/helicopter/heli-silver-1.jpg', quality=95)
        hs_prop = heli_silver.crop((int(w*0.05), int(h*0.05), int(w*0.95), int(h*0.75))).resize((1024, 1024), Image.Resampling.LANCZOS)
        hs_prop.save('public/products/helicopter/heli-silver-2.jpg', quality=95)

        # Sapphire Blue
        heli_blue = create_color_variant(heli_base, 145, sat_mult=1.2, sat_threshold=25)
        heli_blue.save('public/products/helicopter/heli-blue-1.jpg', quality=95)
        hb_prop = heli_blue.crop((int(w*0.05), int(h*0.05), int(w*0.95), int(h*0.75))).resize((1024, 1024), Image.Resampling.LANCZOS)
        hb_prop.save('public/products/helicopter/heli-blue-2.jpg', quality=95)

    # 6. Instant Water Heater Faucet
    os.makedirs('public/products/faucet', exist_ok=True)
    if os.path.exists('public/products/faucet-heater.jpg'):
        faucet_base = Image.open('public/products/faucet-heater.jpg')
        w, h = faucet_base.size

        # Gloss Chrome & White
        faucet_base.save('public/products/faucet/faucet-chrome-1.jpg', quality=95)
        f_display = faucet_base.crop((int(w*0.1), int(h*0.2), int(w*0.9), int(h*0.85))).resize((1024, 1024), Image.Resampling.LANCZOS)
        f_display.save('public/products/faucet/faucet-chrome-2.jpg', quality=95)
        f_spout = faucet_base.crop((int(w*0.05), int(h*0.05), int(w*0.8), int(h*0.65))).resize((1024, 1024), Image.Resampling.LANCZOS)
        f_spout.save('public/products/faucet/faucet-chrome-3.jpg', quality=95)

        # Matte Black
        faucet_black = create_color_variant(faucet_base, 0, sat_mult=0.1, val_mult=0.45, sat_threshold=15)
        faucet_black.save('public/products/faucet/faucet-black-1.jpg', quality=95)
        fb_disp = faucet_black.crop((int(w*0.1), int(h*0.2), int(w*0.9), int(h*0.85))).resize((1024, 1024), Image.Resampling.LANCZOS)
        fb_disp.save('public/products/faucet/faucet-black-2.jpg', quality=95)
        fb_spout = faucet_black.crop((int(w*0.05), int(h*0.05), int(w*0.8), int(h*0.65))).resize((1024, 1024), Image.Resampling.LANCZOS)
        fb_spout.save('public/products/faucet/faucet-black-3.jpg', quality=95)

        # Brushed Gold
        faucet_gold = create_color_variant(faucet_base, 25, sat_mult=1.4, val_mult=1.05, sat_threshold=15)
        faucet_gold.save('public/products/faucet/faucet-gold-1.jpg', quality=95)
        fg_disp = faucet_gold.crop((int(w*0.1), int(h*0.2), int(w*0.9), int(h*0.85))).resize((1024, 1024), Image.Resampling.LANCZOS)
        fg_disp.save('public/products/faucet/faucet-gold-2.jpg', quality=95)

    # 7. TF20 Multipurpose Powerbank with AirPods
    os.makedirs('public/products/powerbank', exist_ok=True)
    if os.path.exists('public/products/powerbank-earbuds.jpg'):
        bank_base = Image.open('public/products/powerbank-earbuds.jpg')
        w, h = bank_base.size

        # Matte Black
        bank_base.save('public/products/powerbank/powerbank-black-1.jpg', quality=95)
        b_dock = bank_base.crop((int(w*0.1), int(h*0.05), int(w*0.9), int(h*0.75))).resize((1024, 1024), Image.Resampling.LANCZOS)
        b_dock.save('public/products/powerbank/powerbank-black-2.jpg', quality=95)
        b_disp = bank_base.crop((int(w*0.15), int(h*0.25), int(w*0.85), int(h*0.9))).resize((1024, 1024), Image.Resampling.LANCZOS)
        b_disp.save('public/products/powerbank/powerbank-black-3.jpg', quality=95)

        # Arctic White
        bank_white = create_color_variant(bank_base, 0, sat_mult=0.1, val_mult=1.6, sat_threshold=10)
        bank_white.save('public/products/powerbank/powerbank-white-1.jpg', quality=95)
        bw_dock = bank_white.crop((int(w*0.1), int(h*0.05), int(w*0.9), int(h*0.75))).resize((1024, 1024), Image.Resampling.LANCZOS)
        bw_dock.save('public/products/powerbank/powerbank-white-2.jpg', quality=95)
        bw_disp = bank_white.crop((int(w*0.15), int(h*0.25), int(w*0.85), int(h*0.9))).resize((1024, 1024), Image.Resampling.LANCZOS)
        bw_disp.save('public/products/powerbank/powerbank-white-3.jpg', quality=95)

        # Cyberpunk Gray/Cyan
        bank_cyber = create_color_variant(bank_base, 130, sat_mult=1.3, sat_threshold=15)
        bank_cyber.save('public/products/powerbank/powerbank-cyber-1.jpg', quality=95)
        bc_dock = bank_cyber.crop((int(w*0.1), int(h*0.05), int(w*0.9), int(h*0.75))).resize((1024, 1024), Image.Resampling.LANCZOS)
        bc_dock.save('public/products/powerbank/powerbank-cyber-2.jpg', quality=95)

    # 8. Popcorn Maker
    os.makedirs('public/products/popcorn', exist_ok=True)
    if os.path.exists('public/products/popcorn-maker.jpg'):
        pop_base = Image.open('public/products/popcorn-maker.jpg')
        w, h = pop_base.size

        # Retro Red
        pop_base.save('public/products/popcorn/popcorn-red-1.jpg', quality=95)
        p_chute = pop_base.crop((int(w*0.1), int(h*0.05), int(w*0.9), int(h*0.75))).resize((1024, 1024), Image.Resampling.LANCZOS)
        p_chute.save('public/products/popcorn/popcorn-red-2.jpg', quality=95)
        p_chamber = pop_base.crop((int(w*0.15), int(h*0.25), int(w*0.85), int(h*0.95))).resize((1024, 1024), Image.Resampling.LANCZOS)
        p_chamber.save('public/products/popcorn/popcorn-red-3.jpg', quality=95)

        # Butter Yellow
        pop_yellow = create_color_variant(pop_base, 35, sat_mult=1.1, sat_threshold=30)
        pop_yellow.save('public/products/popcorn/popcorn-yellow-1.jpg', quality=95)
        py_chute = pop_yellow.crop((int(w*0.1), int(h*0.05), int(w*0.9), int(h*0.75))).resize((1024, 1024), Image.Resampling.LANCZOS)
        py_chute.save('public/products/popcorn/popcorn-yellow-2.jpg', quality=95)
        py_chamber = pop_yellow.crop((int(w*0.15), int(h*0.25), int(w*0.85), int(h*0.95))).resize((1024, 1024), Image.Resampling.LANCZOS)
        py_chamber.save('public/products/popcorn/popcorn-yellow-3.jpg', quality=95)

        # Vintage Mint Green
        pop_mint = create_color_variant(pop_base, 90, sat_mult=0.9, sat_threshold=30)
        pop_mint.save('public/products/popcorn/popcorn-mint-1.jpg', quality=95)
        pm_chute = pop_mint.crop((int(w*0.1), int(h*0.05), int(w*0.9), int(h*0.75))).resize((1024, 1024), Image.Resampling.LANCZOS)
        pm_chute.save('public/products/popcorn/popcorn-mint-2.jpg', quality=95)

    print("All angle images and color variants generated successfully!")

if __name__ == '__main__':
    main()
