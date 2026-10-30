#!/usr/bin/env python3
"""
Generate a complete, high-fidelity, scalable SVG mockup of the entire
Turkiye Jam / Zupe Store landing page.
Canvas: 1440 x 6200 px
"""

import os
import xml.etree.ElementTree as ET

def build_landing_page_svg():
    svg_parts = []
    
    # 1. Header & Definitions
    svg_parts.append('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 6200" width="1440" height="6200" style="background:#FCFBF8; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;">
  <defs>
    <!-- Google Fonts import -->
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&amp;family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&amp;family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Caveat:wght@700&amp;display=swap');

      .font-serif { font-family: 'Playfair Display', Georgia, serif; }
      .font-cinzel { font-family: 'Cinzel', serif; letter-spacing: 0.05em; }
      .font-cursive { font-family: 'Caveat', cursive; }
      .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }

      .hover-scale { transition: transform 0.25s ease; cursor: pointer; }
      .hover-scale:hover { transform: scale(1.02); }
    </style>

    <!-- Drop Shadows & Filters -->
    <filter id="cardShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#1A0508" flood-opacity="0.08" />
    </filter>
    <filter id="cardShadowStrong" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#000000" flood-opacity="0.16" />
    </filter>
    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="10" flood-color="#FED000" flood-opacity="0.45" />
    </filter>
    <filter id="heroAura" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="60" result="blur" />
    </filter>

    <!-- Gradients -->
    <linearGradient id="wineHeroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#731A26" />
      <stop offset="50%" stop-color="#58141E" />
      <stop offset="100%" stop-color="#3A0B12" />
    </linearGradient>

    <linearGradient id="wineFooterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#54121C" />
      <stop offset="100%" stop-color="#28070B" />
    </linearGradient>

    <linearGradient id="goldButtonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FED000" />
      <stop offset="100%" stop-color="#F5B800" />
    </linearGradient>

    <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE885" />
      <stop offset="60%" stop-color="#FED000" />
      <stop offset="100%" stop-color="#D49B00" />
    </linearGradient>

    <linearGradient id="forestGreenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0E4A3B" />
      <stop offset="50%" stop-color="#145C49" />
      <stop offset="100%" stop-color="#0E4A3B" />
    </linearGradient>

    <linearGradient id="sachetFoilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B81D33" />
      <stop offset="40%" stop-color="#911425" />
      <stop offset="70%" stop-color="#D83049" />
      <stop offset="100%" stop-color="#6E0E1B" />
    </linearGradient>

    <linearGradient id="glassJarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFFDF9" stop-opacity="0.8" />
      <stop offset="15%" stop-color="#804A00" stop-opacity="0.9" />
      <stop offset="50%" stop-color="#4A2600" stop-opacity="0.95" />
      <stop offset="85%" stop-color="#804A00" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#FFFDF9" stop-opacity="0.8" />
    </linearGradient>

    <!-- Patterns: Ottoman Diamond Trellis -->
    <pattern id="diamondPatternWine" x="0" y="0" width="36" height="54" patternUnits="userSpaceOnUse">
      <path d="M 18 0 L 36 27 L 18 54 L 0 27 Z" fill="none" stroke="#FFFFFF" stroke-opacity="0.05" stroke-width="1.2" />
      <circle cx="18" cy="27" r="1.5" fill="#FED000" fill-opacity="0.2" />
    </pattern>

    <pattern id="diamondPatternCream" x="0" y="0" width="40" height="60" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 40 30 L 20 60 L 0 30 Z" fill="none" stroke="#58141E" stroke-opacity="0.04" stroke-width="1" />
      <circle cx="20" cy="30" r="1.5" fill="#58141E" fill-opacity="0.06" />
    </pattern>

    <!-- Symbols -->
    <g id="starIcon">
      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="#FED000" />
    </g>

    <g id="verifiedBadge">
      <circle cx="10" cy="10" r="9" fill="#0E4A3B" />
      <path d="M 6 10 L 9 13 L 14 7" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </defs>
''')

    # =========================================================================
    # SECTION 1: TOP NAVIGATION BAR (y: 0 - 90)
    # =========================================================================
    svg_parts.append('''
  <!-- ==================== SECTION 1: TOP NAVIGATION ==================== -->
  <g id="navbar">
    <rect x="0" y="0" width="1440" height="90" fill="#4B1019" fill-opacity="0.96" />
    <line x1="0" y1="90" x2="1440" y2="90" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />

    <!-- Logo Group -->
    <g transform="translate(80, 20)">
      <rect x="0" y="0" width="160" height="50" rx="6" fill="#FFFFFF" fill-opacity="0.08" stroke="#FED000" stroke-opacity="0.3" stroke-width="1" />
      <text x="80" y="27" text-anchor="middle" class="font-cinzel" font-size="16" font-weight="900" fill="#FFFFFF" letter-spacing="2">TÜRKIYE</text>
      <text x="80" y="42" text-anchor="middle" class="font-cinzel" font-size="12" font-weight="700" fill="#FED000" letter-spacing="4">JAM</text>
    </g>

    <!-- Navigation Links -->
    <g class="font-sans" font-size="15" font-weight="600" fill="#F0E8EA" transform="translate(420, 52)">
      <text x="0" y="0" class="hover-scale" fill="#FED000">Overview</text>
      <text x="110" y="0" class="hover-scale">Pick Your Pack</text>
      <text x="260" y="0" class="hover-scale">Direct Import Story</text>
      <text x="440" y="0" class="hover-scale">Authentic Reviews</text>
      <text x="610" y="0" class="hover-scale">How It Works</text>
      <text x="740" y="0" class="hover-scale">FAQ</text>
    </g>

    <!-- Right Side Actions: Track Order & Cart -->
    <g transform="translate(1200, 26)">
      <!-- Cart Button -->
      <rect x="0" y="0" width="150" height="42" rx="21" fill="url(#goldButtonGrad)" filter="url(#goldGlow)" />
      <!-- Cart Icon -->
      <path d="M 28 14 L 32 14 L 35 28 L 48 28 L 50 18 L 33 18" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="36" cy="32" r="2" fill="#1A1A1A" />
      <circle cx="46" cy="32" r="2" fill="#1A1A1A" />
      <text x="65" y="27" class="font-sans" font-size="14" font-weight="800" fill="#1A1A1A">BAG (0)</text>
    </g>
  </g>
''')

    # =========================================================================
    # SECTION 2: HERO SECTION (y: 90 - 950)
    # =========================================================================
    svg_parts.append('''
  <!-- ==================== SECTION 2: HERO SECTION ==================== -->
  <g id="hero">
    <!-- Wine Background with Diamond Trellis -->
    <rect x="0" y="90" width="1440" height="860" fill="url(#wineHeroGrad)" />
    <rect x="0" y="90" width="1440" height="860" fill="url(#diamondPatternWine)" />

    <!-- Ambient Gold Aura Behind Product -->
    <ellipse cx="1060" cy="540" rx="280" ry="240" fill="#FED000" fill-opacity="0.14" filter="url(#heroAura)" />

    <!-- Left Column: Copy & Value Proposition -->
    <g transform="translate(100, 230)">
      <!-- Cursive Tagline -->
      <text x="0" y="0" class="font-cursive" font-size="44" font-weight="700" fill="#FED000">Straight from Turkey!</text>

      <!-- Main Heading Stamp -->
      <g transform="translate(0, 30)">
        <text x="0" y="80" class="font-cinzel" font-size="68" font-weight="900" fill="#FFFFFF" letter-spacing="3">TÜRKIYE</text>
        <text x="0" y="155" class="font-cinzel" font-size="68" font-weight="900" fill="url(#goldTextGrad)" letter-spacing="4">JAM</text>
        <line x1="0" y1="175" x2="380" y2="175" stroke="#FED000" stroke-width="3" stroke-linecap="round" />
      </g>

      <!-- Subtitle Description -->
      <text x="0" y="270" class="font-sans" font-size="20" font-weight="500" fill="#E8DFE1" line-height="34">
        <tspan x="0" dy="0">An authentic Ottoman herbal preserve crafted with pure Anatolian</tspan>
        <tspan x="0" dy="32">honey, Epimedium, and 12 revitalizing botanicals.</tspan>
        <tspan x="0" dy="32">Delivered discreetly all across India in 1–2 business days.</tspan>
      </text>

      <!-- Key Trust Bullet Badges -->
      <g transform="translate(0, 385)">
        <g transform="translate(0, 0)">
          <use href="#verifiedBadge" x="0" y="0" />
          <text x="28" y="15" class="font-sans" font-size="15" font-weight="600" fill="#FFFFFF">100% Herbal Themra Macun</text>
        </g>
        <g transform="translate(260, 0)">
          <use href="#verifiedBadge" x="0" y="0" />
          <text x="28" y="15" class="font-sans" font-size="15" font-weight="600" fill="#FFFFFF">Cash On Delivery (COD)</text>
        </g>
        <g transform="translate(0, 35)">
          <use href="#verifiedBadge" x="0" y="0" />
          <text x="28" y="15" class="font-sans" font-size="15" font-weight="600" fill="#FFFFFF">Discreet Unmarked Box</text>
        </g>
        <g transform="translate(260, 35)">
          <use href="#verifiedBadge" x="0" y="0" />
          <text x="28" y="15" class="font-sans" font-size="15" font-weight="600" fill="#FFFFFF">Air-Couriers from Istanbul</text>
        </g>
      </g>

      <!-- CTA Button & Rating -->
      <g transform="translate(0, 480)">
        <rect x="0" y="0" width="280" height="64" rx="32" fill="url(#goldButtonGrad)" filter="url(#goldGlow)" />
        <text x="140" y="40" text-anchor="middle" class="font-sans" font-size="18" font-weight="800" fill="#1A1A1A">SHOP THE COLLECTION →</text>

        <!-- Social Proof Pill -->
        <g transform="translate(320, 10)">
          <g transform="translate(0, 0)">
            <use href="#starIcon" x="0" y="0" />
            <use href="#starIcon" x="20" y="0" />
            <use href="#starIcon" x="40" y="0" />
            <use href="#starIcon" x="60" y="0" />
            <use href="#starIcon" x="80" y="0" />
          </g>
          <text x="0" y="40" class="font-sans" font-size="14" font-weight="700" fill="#FFFFFF">4.9 / 5.0 Rating</text>
          <text x="95" y="40" class="font-sans" font-size="14" font-weight="500" fill="#E8DFE1">(2,840+ verified lovers)</text>
        </g>
      </g>
    </g>

    <!-- Right Column: Hero Visual Product Showcase -->
    <g transform="translate(860, 240)">
      <!-- Giant Anatolian 240g Glass Jar Vector Render -->
      <g transform="translate(120, 60)" filter="url(#cardShadowStrong)">
        <!-- Gold Screw Cap -->
        <rect x="70" y="20" width="160" height="42" rx="8" fill="url(#goldButtonGrad)" stroke="#806200" stroke-width="2" />
        <line x1="80" y1="34" x2="220" y2="34" stroke="#806200" stroke-width="1.5" />
        <line x1="80" y1="44" x2="220" y2="44" stroke="#806200" stroke-width="1.5" />

        <!-- Jar Body -->
        <path d="M 50 62 L 250 62 Q 270 70 270 110 L 270 420 Q 270 450 240 450 L 60 450 Q 30 450 30 420 L 30 110 Q 30 70 50 62 Z" fill="url(#glassJarGrad)" stroke="#D4A800" stroke-width="3" />

        <!-- Honey/Jam Fill Core -->
        <rect x="42" y="80" width="216" height="355" rx="8" fill="#3D1804" />
        
        <!-- Label Base (Wine Red with Gold Borders) -->
        <rect x="50" y="140" width="200" height="230" rx="10" fill="#58141E" stroke="#FED000" stroke-width="2" />
        <rect x="56" y="146" width="188" height="218" rx="6" fill="none" stroke="#FED000" stroke-opacity="0.5" stroke-dasharray="4 2" />

        <!-- Label Artwork & Text -->
        <text x="150" y="185" text-anchor="middle" class="font-cursive" font-size="20" font-weight="700" fill="#FED000">Epimedium Macun</text>
        <text x="150" y="215" text-anchor="middle" class="font-cinzel" font-size="20" font-weight="900" fill="#FFFFFF">TÜRKIYE</text>
        <text x="150" y="235" text-anchor="middle" class="font-cinzel" font-size="14" font-weight="700" fill="#FED000" letter-spacing="3">JAM</text>

        <circle cx="150" cy="270" r="24" fill="#0E4A3B" stroke="#FED000" stroke-width="1.5" />
        <text x="150" y="275" text-anchor="middle" class="font-cinzel" font-size="11" font-weight="800" fill="#FFFFFF">ORIGINAL</text>

        <text x="150" y="320" text-anchor="middle" class="font-sans" font-size="11" font-weight="700" fill="#FED000">NET WT. 240g</text>
        <text x="150" y="340" text-anchor="middle" class="font-sans" font-size="10" font-weight="600" fill="#E8DFE1">PURE ANATOLIAN HONEY</text>
      </g>

      <!-- Sachet 1 (Tilted Left) -->
      <g transform="translate(20, 240) rotate(-18)" filter="url(#cardShadowStrong)">
        <rect x="0" y="0" width="90" height="240" rx="10" fill="url(#sachetFoilGrad)" stroke="#FED000" stroke-width="2" />
        <!-- Top Tear Notch -->
        <polygon points="0,25 8,30 0,35" fill="#58141E" />
        <polygon points="90,25 82,30 90,35" fill="#58141E" />
        <text x="45" y="80" text-anchor="middle" class="font-cinzel" font-size="13" font-weight="900" fill="#FFFFFF">TÜRKIYE</text>
        <text x="45" y="98" text-anchor="middle" class="font-cinzel" font-size="10" font-weight="700" fill="#FED000">JAM</text>
        <circle cx="45" cy="140" r="16" fill="#0E4A3B" />
        <text x="45" y="145" text-anchor="middle" class="font-sans" font-size="8" font-weight="800" fill="#FFFFFF">12g</text>
        <text x="45" y="190" text-anchor="middle" class="font-sans" font-size="9" font-weight="700" fill="#FED000">SINGLE DOSE</text>
      </g>

      <!-- Sachet 2 (Tilted Right) -->
      <g transform="translate(360, 200) rotate(15)" filter="url(#cardShadowStrong)">
        <rect x="0" y="0" width="90" height="240" rx="10" fill="url(#sachetFoilGrad)" stroke="#FED000" stroke-width="2" />
        <polygon points="0,25 8,30 0,35" fill="#58141E" />
        <polygon points="90,25 82,30 90,35" fill="#58141E" />
        <text x="45" y="80" text-anchor="middle" class="font-cinzel" font-size="13" font-weight="900" fill="#FFFFFF">TÜRKIYE</text>
        <text x="45" y="98" text-anchor="middle" class="font-cinzel" font-size="10" font-weight="700" fill="#FED000">JAM</text>
        <circle cx="45" cy="140" r="16" fill="#0E4A3B" />
        <text x="45" y="145" text-anchor="middle" class="font-sans" font-size="8" font-weight="800" fill="#FFFFFF">12g</text>
        <text x="45" y="190" text-anchor="middle" class="font-sans" font-size="9" font-weight="700" fill="#FED000">SINGLE DOSE</text>
      </g>
    </g>
  </g>
''')

    # =========================================================================
    # SECTION 3: TRUST TICKER MARQUEE (y: 950 - 1030)
    # =========================================================================
    svg_parts.append('''
  <!-- ==================== SECTION 3: TRUST TICKER MARQUEE ==================== -->
  <g id="marquee" transform="translate(0, 950)">
    <rect x="0" y="0" width="1440" height="80" fill="url(#forestGreenGrad)" />
    <line x1="0" y1="0" x2="1440" y2="0" stroke="#FED000" stroke-width="2" />
    <line x1="0" y1="80" x2="1440" y2="80" stroke="#FED000" stroke-width="2" />

    <g class="font-sans" font-size="15" font-weight="700" fill="#FFFFFF" letter-spacing="1" transform="translate(30, 46)">
      <text x="0" y="0">✦ DIRECT IMPORT FROM TURKEY</text>
      <text x="270" y="0">✦ 100% HERBAL THEMRA FORMULA</text>
      <text x="580" y="0">✦ DISCREET PLAIN BOX PACKAGING</text>
      <text x="890" y="0">✦ PREPAID EXPRESS IN 1–2 DAYS</text>
      <text x="1190" y="0">✦ CASH ON DELIVERY AVAILABLE</text>
    </g>
  </g>
''')

    # =========================================================================
    # SECTION 4: PICK YOUR PACK (y: 1030 - 2250)
    # =========================================================================
    svg_parts.append('''
  <!-- ==================== SECTION 4: PICK YOUR PACK ==================== -->
  <g id="pick-your-pack" transform="translate(0, 1030)">
    <!-- Cream textured background -->
    <rect x="0" y="0" width="1440" height="1220" fill="#FCFBF8" />
    <rect x="0" y="0" width="1440" height="1220" fill="url(#diamondPatternCream)" />

    <!-- Section Heading -->
    <g transform="translate(720, 80)" text-anchor="middle">
      <text x="0" y="0" class="font-cursive" font-size="34" font-weight="700" fill="#8E1C2E">six ways to taste it</text>
      <text x="0" y="46" class="font-serif" font-size="46" font-weight="800" fill="#1A1A1A">
        Pick your <tspan fill="#8E1C2E" font-style="italic">pack</tspan>
      </text>
      <text x="0" y="85" class="font-sans" font-size="17" font-weight="500" fill="#665E60">
        Listed from trial to bulk. The larger the pack, the more savings per sachet.
      </text>
      
      <!-- Pill Badge -->
      <g transform="translate(-190, 110)">
        <rect x="0" y="0" width="380" height="36" rx="18" fill="#58141E" />
        <text x="190" y="23" text-anchor="middle" class="font-sans" font-size="13" font-weight="700" fill="#FED000">
          🔥 BEST DEAL: SAVE UP TO 52% ON BOX PACKS
        </text>
      </g>
    </g>

    <!-- 6 Product Cards Grid (3 Columns x 2 Rows) -->
    <!-- Grid Settings: Card Width 380, Gap 30, Left Margin 115, Y Top 270, Row Gap 460 -->
''')

    packs = [
        # Col 0, Row 0
        {"col": 0, "row": 0, "name": "Trial Pack", "sub": "2 Single Sachets", "price": "₹499", "orig": "₹799", "save": "SAVE ₹300", "tag": "FIRST TIMERS", "badge_color": "#0E4A3B", "pop": False},
        # Col 1, Row 0
        {"col": 1, "row": 0, "name": "Couple Pack", "sub": "3 Single Sachets", "price": "₹699", "orig": "₹1,099", "save": "SAVE ₹400", "tag": "WEEKEND SPECIAL", "badge_color": "#8E1C2E", "pop": False},
        # Col 2, Row 0
        {"col": 2, "row": 0, "name": "Power 4-Pack", "sub": "4 Single Sachets", "price": "₹899", "orig": "₹1,499", "save": "SAVE ₹600", "tag": "VALUE CHOICE", "badge_color": "#0E4A3B", "pop": False},
        # Col 0, Row 1
        {"col": 0, "row": 1, "name": "Weekly Vitality", "sub": "6 Single Sachets", "price": "₹1,299", "orig": "₹2,199", "save": "SAVE ₹900", "tag": "MOST POPULAR", "badge_color": "#FED000", "badge_text_color": "#1A1A1A", "pop": True},
        # Col 1, Row 1
        {"col": 1, "row": 1, "name": "Anatolian Glass Jar", "sub": "240g Honey Paste + Spoon", "price": "₹1,899", "orig": "₹2,999", "save": "SAVE ₹1,100", "tag": "TRADITIONAL RITUAL", "badge_color": "#8E1C2E", "pop": False},
        # Col 2, Row 1
        {"col": 2, "row": 1, "name": "Royal Gift Box", "sub": "14 Sachets Luxury Box", "price": "₹2,799", "orig": "₹4,999", "save": "SAVE ₹2,200", "tag": "ULTIMATE VALUE", "badge_color": "#58141E", "pop": False},
    ]

    for p in packs:
        cx = 115 + p["col"] * 410
        cy = 280 + p["row"] * 440
        bcolor = p["badge_color"]
        btcolor = p.get("badge_text_color", "#FFFFFF")
        stroke_color = "#FED000" if p["pop"] else "#E5DDD8"
        stroke_width = "2.5" if p["pop"] else "1.5"

        svg_parts.append(f'''
    <!-- Card: {p['name']} -->
    <g transform="translate({cx}, {cy})" filter="url(#cardShadow)">
      <!-- Card Container -->
      <rect x="0" y="0" width="380" height="400" rx="18" fill="#FFFFFF" stroke="{stroke_color}" stroke-width="{stroke_width}" />
      
      <!-- Top Tag Badge -->
      <rect x="25" y="20" width="130" height="28" rx="14" fill="{bcolor}" />
      <text x="90" y="38" text-anchor="middle" class="font-sans" font-size="11" font-weight="800" fill="{btcolor}" letter-spacing="1">{p['tag']}</text>

      <!-- Savings Pill -->
      <rect x="260" y="20" width="95" height="28" rx="14" fill="#0E4A3B" fill-opacity="0.12" />
      <text x="307" y="38" text-anchor="middle" class="font-sans" font-size="11" font-weight="800" fill="#0E4A3B">{p['save']}</text>

      <!-- Product Miniature Visual in Card -->
      <g transform="translate(190, 130)">
        <circle cx="0" cy="0" r="50" fill="#F8F4EE" />
        <!-- Miniature Sachet / Jar Illustration -->
        <rect x="-24" y="-35" width="48" height="70" rx="6" fill="url(#sachetFoilGrad)" stroke="#FED000" stroke-width="1.5" />
        <text x="0" y="-8" text-anchor="middle" class="font-cinzel" font-size="9" font-weight="900" fill="#FFFFFF">JAM</text>
        <circle cx="0" cy="14" r="8" fill="#FED000" />
      </g>

      <!-- Product Name & Sub -->
      <text x="190" y="215" text-anchor="middle" class="font-serif" font-size="22" font-weight="800" fill="#1A1A1A">{p['name']}</text>
      <text x="190" y="238" text-anchor="middle" class="font-sans" font-size="14" font-weight="500" fill="#756D6F">{p['sub']}</text>

      <!-- Pricing Block -->
      <g transform="translate(190, 280)" text-anchor="middle">
        <text x="-40" y="0" class="font-sans" font-size="28" font-weight="900" fill="#58141E">{p['price']}</text>
        <text x="35" y="-3" class="font-sans" font-size="16" font-weight="500" fill="#A89E9F" text-decoration="line-through">{p['orig']}</text>
      </g>

      <!-- Add to Bag CTA Button -->
      <g transform="translate(40, 315)">
        <rect x="0" y="0" width="300" height="52" rx="26" fill="{'url(#goldButtonGrad)' if p['pop'] else '#58141E'}" />
        <text x="150" y="32" text-anchor="middle" class="font-sans" font-size="15" font-weight="800" fill="{'#1A1A1A' if p['pop'] else '#FFFFFF'}">
          ADD TO BAG • QUICK BUY
        </text>
      </g>
    </g>
''')

    svg_parts.append('  </g>\n')

    # =========================================================================
    # SECTION 5: ORIGIN & DIRECT IMPORT FLIGHT ROUTE (y: 2250 - 3100)
    # =========================================================================
    svg_parts.append('''
  <!-- ==================== SECTION 5: ORIGIN & DIRECT IMPORT ==================== -->
  <g id="origin-story" transform="translate(0, 2250)">
    <!-- Deep Maroon Background -->
    <rect x="0" y="0" width="1440" height="850" fill="url(#wineHeroGrad)" />
    <rect x="0" y="0" width="1440" height="850" fill="url(#diamondPatternWine)" />

    <!-- Section Heading -->
    <g transform="translate(720, 80)" text-anchor="middle">
      <text x="0" y="0" class="font-cursive" font-size="34" font-weight="700" fill="#FED000">From Anatolia to Your Doorstep</text>
      <text x="0" y="46" class="font-serif" font-size="44" font-weight="800" fill="#FFFFFF">
        Imported Direct from <tspan fill="#FED000">Turkey</tspan> to <tspan fill="#FED000">India</tspan>
      </text>
      <text x="0" y="82" class="font-sans" font-size="16" font-weight="500" fill="#E8DFE1">
        No third-party repacking. Authentic sealed Themra Epimedium macun paste dispatched weekly.
      </text>
    </g>

    <!-- Flight Map Card Vector Graphic -->
    <g transform="translate(140, 220)" filter="url(#cardShadowStrong)">
      <rect x="0" y="0" width="1160" height="420" rx="24" fill="#3A0B12" stroke="#FED000" stroke-opacity="0.3" stroke-width="2" />
      
      <!-- Continents & Land Vector Stylization -->
      <path d="M 120 180 Q 240 100 380 140 T 600 170 Q 750 150 920 220 T 1060 300" fill="none" stroke="#FED000" stroke-opacity="0.1" stroke-width="80" stroke-linecap="round" />

      <!-- Istanbul Origin Node -->
      <g transform="translate(240, 160)">
        <circle cx="0" cy="0" r="26" fill="#FED000" />
        <circle cx="0" cy="0" r="14" fill="#58141E" />
        <text x="0" y="48" text-anchor="middle" class="font-cinzel" font-size="18" font-weight="900" fill="#FED000">ISTANBUL</text>
        <text x="0" y="68" text-anchor="middle" class="font-sans" font-size="13" font-weight="600" fill="#E8DFE1">Manufactured &amp; Sealed</text>
      </g>

      <!-- Flight Arc Route -->
      <path d="M 260 160 Q 600 40 900 240" fill="none" stroke="#FED000" stroke-width="4" stroke-dasharray="10 8" />

      <!-- In-flight Airplane Vector -->
      <g transform="translate(580, 85) rotate(22)">
        <path d="M 0 -15 L 18 10 L 0 5 L -18 10 Z" fill="#FED000" />
      </g>

      <!-- Kochi / Mumbai Delivery Node -->
      <g transform="translate(900, 240)">
        <circle cx="0" cy="0" r="26" fill="#0E4A3B" stroke="#FED000" stroke-width="3" />
        <circle cx="0" cy="0" r="14" fill="#FED000" />
        <text x="0" y="48" text-anchor="middle" class="font-cinzel" font-size="18" font-weight="900" fill="#FED000">INDIA HUB</text>
        <text x="0" y="68" text-anchor="middle" class="font-sans" font-size="13" font-weight="600" fill="#E8DFE1">Discreet Hub &amp; Express Delivery</text>
      </g>

      <!-- 3 Route Milestones -->
      <g transform="translate(80, 310)">
        <rect x="0" y="0" width="300" height="70" rx="12" fill="#58141E" stroke="#FED000" stroke-opacity="0.3" stroke-width="1" />
        <text x="25" y="30" class="font-sans" font-size="14" font-weight="800" fill="#FED000">1. Fresh Harvest</text>
        <text x="25" y="52" class="font-sans" font-size="12" font-weight="500" fill="#E8DFE1">Turkish Honey &amp; Epimedium</text>
      </g>

      <g transform="translate(430, 310)">
        <rect x="0" y="0" width="300" height="70" rx="12" fill="#58141E" stroke="#FED000" stroke-opacity="0.3" stroke-width="1" />
        <text x="25" y="30" class="font-sans" font-size="14" font-weight="800" fill="#FED000">2. Air Cargo Courier</text>
        <text x="25" y="52" class="font-sans" font-size="12" font-weight="500" fill="#E8DFE1">Temperature controlled transit</text>
      </g>

      <g transform="translate(780, 310)">
        <rect x="0" y="0" width="300" height="70" rx="12" fill="#58141E" stroke="#FED000" stroke-opacity="0.3" stroke-width="1" />
        <text x="25" y="30" class="font-sans" font-size="14" font-weight="800" fill="#FED000">3. Plain Box Dispatch</text>
        <text x="25" y="52" class="font-sans" font-size="12" font-weight="500" fill="#E8DFE1">100% confidential delivery</text>
      </g>
    </g>

    <!-- Bottom Assurance Ribbon -->
    <g transform="translate(720, 740)" text-anchor="middle">
      <text x="0" y="0" class="font-sans" font-size="15" font-weight="700" fill="#FED000">
        🛡️ GUARANTEED ORIGINAL THEMRA STAMP ON EVERY PACK • MONEY BACK IF COUNTERFEIT
      </text>
    </g>
  </g>
''')

    # =========================================================================
    # SECTION 6: WHY CHOOSE TURKIYE JAM & 4 BENEFITS (y: 3100 - 3900)
    # =========================================================================
    svg_parts.append('''
  <!-- ==================== SECTION 6: BENEFITS & COMPARISON ==================== -->
  <g id="benefits" transform="translate(0, 3100)">
    <rect x="0" y="0" width="1440" height="800" fill="#FCFBF8" />
    <rect x="0" y="0" width="1440" height="800" fill="url(#diamondPatternCream)" />

    <g transform="translate(720, 80)" text-anchor="middle">
      <text x="0" y="0" class="font-cursive" font-size="34" font-weight="700" fill="#8E1C2E">pure nature vs synthetics</text>
      <text x="0" y="46" class="font-serif" font-size="44" font-weight="800" fill="#1A1A1A">
        Why Couples Swear By <tspan fill="#8E1C2E">Turkiye Jam</tspan>
      </text>
      <text x="0" y="82" class="font-sans" font-size="16" font-weight="500" fill="#665E60">
        Centuries of Anatolian botanical wisdom in every spoonful. No synthetic blue pills, no crashes.
      </text>
    </g>

    <!-- 4 Benefit Cards Grid (2x2) -->
    <!-- Col 0: x=140, Col 1: x=740 | Row 0: y=220, Row 1: y=470 -->
    <g transform="translate(140, 220)" filter="url(#cardShadow)">
      <rect x="0" y="0" width="560" height="210" rx="16" fill="#FFFFFF" stroke="#E5DDD8" stroke-width="1.5" />
      <circle cx="60" cy="60" r="32" fill="#0E4A3B" fill-opacity="0.1" />
      <text x="60" y="70" text-anchor="middle" font-size="28">🌿</text>
      <text x="115" y="55" class="font-serif" font-size="22" font-weight="800" fill="#1A1A1A">100% Herbal Active Macun</text>
      <text x="115" y="90" class="font-sans" font-size="15" font-weight="500" fill="#665E60" line-height="24">
        <tspan x="115" dy="0">Infused with genuine Epimedium (Horny Goat Weed), red</tspan>
        <tspan x="115" dy="24">ginseng, ginger root, and royal jelly. Completely organic.</tspan>
      </text>
    </g>

    <g transform="translate(740, 220)" filter="url(#cardShadow)">
      <rect x="0" y="0" width="560" height="210" rx="16" fill="#FFFFFF" stroke="#E5DDD8" stroke-width="1.5" />
      <circle cx="60" cy="60" r="32" fill="#8E1C2E" fill-opacity="0.1" />
      <text x="60" y="70" text-anchor="middle" font-size="28">⚡</text>
      <text x="115" y="55" class="font-serif" font-size="22" font-weight="800" fill="#1A1A1A">Rapid 30-Minute Activation</text>
      <text x="115" y="90" class="font-sans" font-size="15" font-weight="500" fill="#665E60" line-height="24">
        <tspan x="115" dy="0">Fast sublingual honey absorption allows active botanical</tspan>
        <tspan x="115" dy="24">bio-actives to energize the body in 30 to 45 minutes.</tspan>
      </text>
    </g>

    <g transform="translate(140, 470)" filter="url(#cardShadow)">
      <rect x="0" y="0" width="560" height="210" rx="16" fill="#FFFFFF" stroke="#E5DDD8" stroke-width="1.5" />
      <circle cx="60" cy="60" r="32" fill="#FED000" fill-opacity="0.2" />
      <text x="60" y="70" text-anchor="middle" font-size="28">❤️</text>
      <text x="115" y="55" class="font-serif" font-size="22" font-weight="800" fill="#1A1A1A">Mutual Chemistry for Couples</text>
      <text x="115" y="90" class="font-sans" font-size="15" font-weight="500" fill="#665E60" line-height="24">
        <tspan x="115" dy="0">Formulated for both men and women to spark mutual desire,</tspan>
        <tspan x="115" dy="24">stamina, and shared intimacy without fatigue.</tspan>
      </text>
    </g>

    <g transform="translate(740, 470)" filter="url(#cardShadow)">
      <rect x="0" y="0" width="560" height="210" rx="16" fill="#FFFFFF" stroke="#E5DDD8" stroke-width="1.5" />
      <circle cx="60" cy="60" r="32" fill="#0E4A3B" fill-opacity="0.1" />
      <text x="60" y="70" text-anchor="middle" font-size="28">🛡️</text>
      <text x="115" y="55" class="font-serif" font-size="22" font-weight="800" fill="#1A1A1A">Zero Side Effects or Headaches</text>
      <text x="115" y="90" class="font-sans" font-size="15" font-weight="500" fill="#665E60" line-height="24">
        <tspan x="115" dy="0">Gentle on the heart, normalizes blood flow naturally without</tspan>
        <tspan x="115" dy="24">the flushing or pounding headaches of chemical pills.</tspan>
      </text>
    </g>
  </g>
''')

    # =========================================================================
    # SECTION 7: CUSTOMER REVIEWS & SOCIAL PROOF (y: 3900 - 4700)
    # =========================================================================
    svg_parts.append('''
  <!-- ==================== SECTION 7: SOCIAL PROOF & TESTIMONIALS ==================== -->
  <g id="reviews" transform="translate(0, 3900)">
    <rect x="0" y="0" width="1440" height="800" fill="#58141E" />
    <rect x="0" y="0" width="1440" height="800" fill="url(#diamondPatternWine)" />

    <!-- Section Heading -->
    <g transform="translate(720, 80)" text-anchor="middle">
      <text x="0" y="0" class="font-cursive" font-size="34" font-weight="700" fill="#FED000">Loved Across All States</text>
      <text x="0" y="46" class="font-serif" font-size="44" font-weight="800" fill="#FFFFFF">
        Real Couples, Genuine Results
      </text>
      <g transform="translate(-100, 70)">
        <use href="#starIcon" x="0" y="0" />
        <use href="#starIcon" x="25" y="0" />
        <use href="#starIcon" x="50" y="0" />
        <use href="#starIcon" x="75" y="0" />
        <use href="#starIcon" x="100" y="0" />
      </g>
      <text x="0" y="125" class="font-sans" font-size="16" font-weight="600" fill="#FED000">
        4.9 / 5.0 Star Average from 2,840+ Indian Orders
      </text>
    </g>

    <!-- 3 Testimonial Cards -->
    <!-- Card 1 -->
    <g transform="translate(100, 260)" filter="url(#cardShadowStrong)">
      <rect x="0" y="0" width="380" height="420" rx="20" fill="#FFFFFF" />
      <g transform="translate(30, 35)">
        <use href="#starIcon" x="0" y="0" />
        <use href="#starIcon" x="20" y="0" />
        <use href="#starIcon" x="40" y="0" />
        <use href="#starIcon" x="60" y="0" />
        <use href="#starIcon" x="80" y="0" />
      </g>
      <text x="30" y="95" class="font-serif" font-size="18" font-weight="800" fill="#1A1A1A">"Unbelievable difference!"</text>
      <text x="30" y="130" class="font-sans" font-size="14" font-weight="500" fill="#554E50" line-height="24">
        <tspan x="30" dy="0">"I was skeptical because of so many fake</tspan>
        <tspan x="30" dy="24">products online, but this one is the real</tspan>
        <tspan x="30" dy="24">deal. Arrived in 2 days in a plain brown</tspan>
        <tspan x="30" dy="24">box with no awkward labels. My wife and I</tspan>
        <tspan x="30" dy="24">took half a sachet each and the energy was</tspan>
        <tspan x="30" dy="24">simply unforgettable."</tspan>
      </text>

      <line x1="30" y1="320" x2="350" y2="320" stroke="#EFE9E7" stroke-width="1" />
      <!-- Customer Info -->
      <text x="30" y="355" class="font-sans" font-size="15" font-weight="800" fill="#1A1A1A">Karthik &amp; Priya M.</text>
      <text x="30" y="375" class="font-sans" font-size="12" font-weight="500" fill="#756D6F">Bangalore • Verified Buyer</text>
      <use href="#verifiedBadge" x="320" y="345" />
    </g>

    <!-- Card 2 -->
    <g transform="translate(530, 260)" filter="url(#cardShadowStrong)">
      <rect x="0" y="0" width="380" height="420" rx="20" fill="#FFFFFF" />
      <g transform="translate(30, 35)">
        <use href="#starIcon" x="0" y="0" />
        <use href="#starIcon" x="20" y="0" />
        <use href="#starIcon" x="40" y="0" />
        <use href="#starIcon" x="60" y="0" />
        <use href="#starIcon" x="80" y="0" />
      </g>
      <text x="30" y="95" class="font-serif" font-size="18" font-weight="800" fill="#1A1A1A">"Zero headaches, 100% natural"</text>
      <text x="30" y="130" class="font-sans" font-size="14" font-weight="500" fill="#554E50" line-height="24">
        <tspan x="30" dy="0">"Modern chemical pills always give me</tspan>
        <tspan x="30" dy="24">terrible backaches and facial heat.</tspan>
        <tspan x="30" dy="24">Turkiye Jam felt smooth, tasted like rich</tspan>
        <tspan x="30" dy="24">herbal dark honey, and gave sustained</tspan>
        <tspan x="30" dy="24">vitality through the whole night.</tspan>
        <tspan x="30" dy="24">Ordered the 14-sachet gift box immediately."</tspan>
      </text>

      <line x1="30" y1="320" x2="350" y2="320" stroke="#EFE9E7" stroke-width="1" />
      <text x="30" y="355" class="font-sans" font-size="15" font-weight="800" fill="#1A1A1A">Rahul D.</text>
      <text x="30" y="375" class="font-sans" font-size="12" font-weight="500" fill="#756D6F">Mumbai • Verified Buyer</text>
      <use href="#verifiedBadge" x="320" y="345" />
    </g>

    <!-- Card 3 -->
    <g transform="translate(960, 260)" filter="url(#cardShadowStrong)">
      <rect x="0" y="0" width="380" height="420" rx="20" fill="#FFFFFF" />
      <g transform="translate(30, 35)">
        <use href="#starIcon" x="0" y="0" />
        <use href="#starIcon" x="20" y="0" />
        <use href="#starIcon" x="40" y="0" />
        <use href="#starIcon" x="60" y="0" />
        <use href="#starIcon" x="80" y="0" />
      </g>
      <text x="30" y="95" class="font-serif" font-size="18" font-weight="800" fill="#1A1A1A">"Best gift for anniversaries"</text>
      <text x="30" y="130" class="font-sans" font-size="14" font-weight="500" fill="#554E50" line-height="24">
        <tspan x="30" dy="0">"Purchased the traditional 240g glass jar.</tspan>
        <tspan x="30" dy="24">The wooden spoon ritual is fantastic.</tspan>
        <tspan x="30" dy="24">One small teaspoon 40 minutes before bed</tspan>
        <tspan x="30" dy="24">with warm green tea worked like magic.</tspan>
        <tspan x="30" dy="24">Customer care on WhatsApp was very</tspan>
        <tspan x="30" dy="24">helpful and discreet."</tspan>
      </text>

      <line x1="30" y1="320" x2="350" y2="320" stroke="#EFE9E7" stroke-width="1" />
      <text x="30" y="355" class="font-sans" font-size="15" font-weight="800" fill="#1A1A1A">Naveen &amp; Ananya K.</text>
      <text x="30" y="375" class="font-sans" font-size="12" font-weight="500" fill="#756D6F">Kochi • Verified Buyer</text>
      <use href="#verifiedBadge" x="320" y="345" />
    </g>
  </g>
''')

    # =========================================================================
    # SECTION 8: HOW TO USE & DOSAGE GUIDE (y: 4700 - 5250)
    # =========================================================================
    svg_parts.append('''
  <!-- ==================== SECTION 8: HOW TO USE ==================== -->
  <g id="how-to-use" transform="translate(0, 4700)">
    <rect x="0" y="0" width="1440" height="550" fill="#FCFBF8" />
    <rect x="0" y="0" width="1440" height="550" fill="url(#diamondPatternCream)" />

    <g transform="translate(720, 70)" text-anchor="middle">
      <text x="0" y="0" class="font-cursive" font-size="34" font-weight="700" fill="#8E1C2E">simple &amp; effective</text>
      <text x="0" y="44" class="font-serif" font-size="44" font-weight="800" fill="#1A1A1A">
        How to Consume Turkiye Jam
      </text>
    </g>

    <!-- 4 Step Cards -->
    <!-- Width: 270, Gap: 20, Left: 145, Top: 180 -->
    <g transform="translate(145, 180)" filter="url(#cardShadow)">
      <rect x="0" y="0" width="265" height="270" rx="16" fill="#FFFFFF" stroke="#E5DDD8" stroke-width="1.5" />
      <circle cx="50" cy="50" r="22" fill="#58141E" />
      <text x="50" y="57" text-anchor="middle" class="font-sans" font-size="16" font-weight="800" fill="#FED000">1</text>
      <text x="30" y="115" class="font-serif" font-size="20" font-weight="800" fill="#1A1A1A">Knead or Stir</text>
      <text x="30" y="150" class="font-sans" font-size="14" font-weight="500" fill="#665E60" line-height="22">
        <tspan x="30" dy="0">Knead the sachet packet</tspan>
        <tspan x="30" dy="22">or stir the jar paste</tspan>
        <tspan x="30" dy="22">thoroughly to blend the</tspan>
        <tspan x="30" dy="22">active botanical herbs.</tspan>
      </text>
    </g>

    <g transform="translate(430, 180)" filter="url(#cardShadow)">
      <rect x="0" y="0" width="265" height="270" rx="16" fill="#FFFFFF" stroke="#E5DDD8" stroke-width="1.5" />
      <circle cx="50" cy="50" r="22" fill="#58141E" />
      <text x="50" y="57" text-anchor="middle" class="font-sans" font-size="16" font-weight="800" fill="#FED000">2</text>
      <text x="30" y="115" class="font-serif" font-size="20" font-weight="800" fill="#1A1A1A">Take 1 Single Dose</text>
      <text x="30" y="150" class="font-sans" font-size="14" font-weight="500" fill="#665E60" line-height="22">
        <tspan x="30" dy="0">Take 1 single sachet or</tspan>
        <tspan x="30" dy="22">one level teaspoon</tspan>
        <tspan x="30" dy="22">30 to 45 minutes</tspan>
        <tspan x="30" dy="22">prior to intimacy.</tspan>
      </text>
    </g>

    <g transform="translate(715, 180)" filter="url(#cardShadow)">
      <rect x="0" y="0" width="265" height="270" rx="16" fill="#FFFFFF" stroke="#E5DDD8" stroke-width="1.5" />
      <circle cx="50" cy="50" r="22" fill="#58141E" />
      <text x="50" y="57" text-anchor="middle" class="font-sans" font-size="16" font-weight="800" fill="#FED000">3</text>
      <text x="30" y="115" class="font-serif" font-size="20" font-weight="800" fill="#1A1A1A">Drink Warm Water</text>
      <text x="30" y="150" class="font-sans" font-size="14" font-weight="500" fill="#665E60" line-height="22">
        <tspan x="30" dy="0">Follow with 1 full glass</tspan>
        <tspan x="30" dy="22">of lukewarm water or</tspan>
        <tspan x="30" dy="22">herbal tea for rapid</tspan>
        <tspan x="30" dy="22">digestion &amp; uptake.</tspan>
      </text>
    </g>

    <g transform="translate(1000, 180)" filter="url(#cardShadow)">
      <rect x="0" y="0" width="265" height="270" rx="16" fill="#FFFFFF" stroke="#E5DDD8" stroke-width="1.5" />
      <circle cx="50" cy="50" r="22" fill="#58141E" />
      <text x="50" y="57" text-anchor="middle" class="font-sans" font-size="16" font-weight="800" fill="#FED000">4</text>
      <text x="30" y="115" class="font-serif" font-size="20" font-weight="800" fill="#1A1A1A">Feel the Surge</text>
      <text x="30" y="150" class="font-sans" font-size="14" font-weight="500" fill="#665E60" line-height="22">
        <tspan x="30" dy="0">Experience elevated</tspan>
        <tspan x="30" dy="22">warmth, stamina, and</tspan>
        <tspan x="30" dy="22">harmonious energy that</tspan>
        <tspan x="30" dy="22">lasts for up to 24 hours.</tspan>
      </text>
    </g>
  </g>
''')

    # =========================================================================
    # SECTION 9: FAQ & 100% DISCREET PACKAGING (y: 5250 - 5750)
    # =========================================================================
    svg_parts.append('''
  <!-- ==================== SECTION 9: FAQ & GUARANTEES ==================== -->
  <g id="faq" transform="translate(0, 5250)">
    <rect x="0" y="0" width="1440" height="530" fill="#F4EFEA" />
    <rect x="0" y="0" width="1440" height="530" fill="url(#diamondPatternCream)" />

    <g transform="translate(720, 60)" text-anchor="middle">
      <text x="0" y="0" class="font-serif" font-size="38" font-weight="800" fill="#1A1A1A">Frequently Asked Questions</text>
      <text x="0" y="34" class="font-sans" font-size="15" font-weight="500" fill="#665E60">Everything you need to know about delivery and authentic packaging</text>
    </g>

    <!-- 4 FAQ Accordion Rows -->
    <g transform="translate(180, 130)" filter="url(#cardShadow)">
      <!-- FAQ 1 -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="1080" height="74" rx="12" fill="#FFFFFF" />
        <text x="35" y="44" class="font-sans" font-size="17" font-weight="700" fill="#1A1A1A">How discreet is the shipping package?</text>
        <text x="1030" y="44" text-anchor="middle" class="font-sans" font-size="20" font-weight="800" fill="#58141E">+</text>
      </g>

      <!-- FAQ 2 -->
      <g transform="translate(0, 90)">
        <rect x="0" y="0" width="1080" height="74" rx="12" fill="#FFFFFF" />
        <text x="35" y="44" class="font-sans" font-size="17" font-weight="700" fill="#1A1A1A">When will my order arrive across India?</text>
        <text x="1030" y="44" text-anchor="middle" class="font-sans" font-size="20" font-weight="800" fill="#58141E">+</text>
      </g>

      <!-- FAQ 3 -->
      <g transform="translate(0, 180)">
        <rect x="0" y="0" width="1080" height="74" rx="12" fill="#FFFFFF" />
        <text x="35" y="44" class="font-sans" font-size="17" font-weight="700" fill="#1A1A1A">Is Cash on Delivery (COD) supported in all pin codes?</text>
        <text x="1030" y="44" text-anchor="middle" class="font-sans" font-size="20" font-weight="800" fill="#58141E">+</text>
      </g>

      <!-- FAQ 4 -->
      <g transform="translate(0, 270)">
        <rect x="0" y="0" width="1080" height="74" rx="12" fill="#FFFFFF" />
        <text x="35" y="44" class="font-sans" font-size="17" font-weight="700" fill="#1A1A1A">How do I verify the original Themra hologram?</text>
        <text x="1030" y="44" text-anchor="middle" class="font-sans" font-size="20" font-weight="800" fill="#58141E">+</text>
      </g>
    </g>
  </g>
''')

    # =========================================================================
    # SECTION 10: BRAND FOOTER & SECURITY SEALS (y: 5750 - 6200)
    # =========================================================================
    svg_parts.append('''
  <!-- ==================== SECTION 10: BRAND FOOTER ==================== -->
  <g id="footer" transform="translate(0, 5750)">
    <rect x="0" y="0" width="1440" height="450" fill="url(#wineFooterGrad)" />
    <line x1="0" y1="0" x2="1440" y2="0" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />

    <!-- Col 1: Brand Info -->
    <g transform="translate(100, 60)">
      <rect x="0" y="0" width="150" height="44" rx="6" fill="#FFFFFF" fill-opacity="0.08" stroke="#FED000" stroke-opacity="0.3" stroke-width="1" />
      <text x="75" y="24" text-anchor="middle" class="font-cinzel" font-size="15" font-weight="900" fill="#FFFFFF">TÜRKIYE</text>
      <text x="75" y="38" text-anchor="middle" class="font-cinzel" font-size="11" font-weight="700" fill="#FED000">JAM</text>

      <text x="0" y="85" class="font-sans" font-size="14" font-weight="500" fill="#D6CBCD" line-height="24">
        <tspan x="0" dy="0">Imported direct preserves delivered</tspan>
        <tspan x="0" dy="24">safely and discreetly across India.</tspan>
        <tspan x="0" dy="24">Authentic Themra Epimedium formula.</tspan>
      </text>
      
      <!-- WhatsApp Care Button -->
      <g transform="translate(0, 160)">
        <rect x="0" y="0" width="220" height="44" rx="22" fill="#0E4A3B" stroke="#FED000" stroke-width="1" />
        <text x="110" y="27" text-anchor="middle" class="font-sans" font-size="13" font-weight="700" fill="#FFFFFF">
          💬 WhatsApp Care Support
        </text>
      </g>
    </g>

    <!-- Col 2: Shop Links -->
    <g transform="translate(500, 70)">
      <text x="0" y="0" class="font-serif" font-size="18" font-weight="700" fill="#FFFFFF">Shop Packs</text>
      <g class="font-sans" font-size="14" font-weight="500" fill="#D6CBCD" transform="translate(0, 30)">
        <text x="0" y="0">Trial Pack (2 Sachets)</text>
        <text x="0" y="28">Couple Pack (3 Sachets)</text>
        <text x="0" y="56">Power Pack (4 Sachets)</text>
        <text x="0" y="84">Weekly Vitality (6 Sachets)</text>
        <text x="0" y="112">Anatolian Glass Jar (240g)</text>
        <text x="0" y="140">Royal Gift Box (14 Sachets)</text>
      </g>
    </g>

    <!-- Col 3: Customer Care & Policies -->
    <g transform="translate(800, 70)">
      <text x="0" y="0" class="font-serif" font-size="18" font-weight="700" fill="#FFFFFF">Help &amp; Guarantees</text>
      <g class="font-sans" font-size="14" font-weight="500" fill="#D6CBCD" transform="translate(0, 30)">
        <text x="0" y="0">Track Your Order</text>
        <text x="0" y="28">100% Discreet Packaging Policy</text>
        <text x="0" y="56">Shipping &amp; Delivery Timeline</text>
        <text x="0" y="84">Refund &amp; Return Terms</text>
        <text x="0" y="112">Privacy &amp; Security Policy</text>
        <text x="0" y="140">Authenticity Verification</text>
      </g>
    </g>

    <!-- Col 4: Payment Badges & Trust -->
    <g transform="translate(1100, 70)">
      <text x="0" y="0" class="font-serif" font-size="18" font-weight="700" fill="#FFFFFF">Safe &amp; Secure Payment</text>
      <text x="0" y="30" class="font-sans" font-size="13" font-weight="500" fill="#D6CBCD">Encrypted 256-Bit SSL Checkout</text>
      
      <g transform="translate(0, 50)">
        <!-- Badge 1: COD -->
        <rect x="0" y="0" width="80" height="32" rx="4" fill="#FFFFFF" fill-opacity="0.1" />
        <text x="40" y="20" text-anchor="middle" class="font-sans" font-size="12" font-weight="700" fill="#FFFFFF">COD</text>

        <!-- Badge 2: UPI -->
        <rect x="90" y="0" width="80" height="32" rx="4" fill="#FFFFFF" fill-opacity="0.1" />
        <text x="130" y="20" text-anchor="middle" class="font-sans" font-size="12" font-weight="700" fill="#FFFFFF">UPI</text>

        <!-- Badge 3: CARDS -->
        <rect x="180" y="0" width="80" height="32" rx="4" fill="#FFFFFF" fill-opacity="0.1" />
        <text x="220" y="20" text-anchor="middle" class="font-sans" font-size="12" font-weight="700" fill="#FFFFFF">CARDS</text>
      </g>

      <g transform="translate(0, 110)">
        <use href="#verifiedBadge" x="0" y="0" />
        <text x="28" y="15" class="font-sans" font-size="13" font-weight="600" fill="#FED000">Authentic Themra Turkey</text>
      </g>
    </g>

    <!-- Bottom Copyright -->
    <line x1="100" y1="360" x2="1340" y2="360" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />
    <g transform="translate(720, 395)" text-anchor="middle">
      <text x="0" y="0" class="font-sans" font-size="13" font-weight="500" fill="#9C8F92">
        © 2026 Zupe Store / Turkiye Jam India. All rights reserved. Direct import Anatolian herbal formula.
      </text>
    </g>
  </g>
</svg>
''')

    return "".join(svg_parts)

if __name__ == "__main__":
    svg_content = build_landing_page_svg()
    
    # Target 1: public/landing-page.svg
    target_1 = "/Users/pydart/Projects/zupe-store-ecommerce/public/landing-page.svg"
    with open(target_1, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated {target_1} ({len(svg_content)} bytes)")

    # Target 2: public/tj/entire-landing-page.svg
    target_2 = "/Users/pydart/Projects/zupe-store-ecommerce/public/tj/entire-landing-page.svg"
    os.makedirs(os.path.dirname(target_2), exist_ok=True)
    with open(target_2, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated {target_2} ({len(svg_content)} bytes)")
