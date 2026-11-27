"use client";

import React from "react";

interface BrandLogoProps {
  brand: string;
  className?: string;
}

export function BrandLogo({ brand, className = "h-5 w-auto" }: BrandLogoProps) {
  switch (brand) {
    case "Nike":
      return (
        <svg
          viewBox="0 0 72 22"
          className={className}
          aria-label="Nike"
          role="img"
        >
          {/* NIKE Bold Italic Typography */}
          <text
            x="0"
            y="16"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="18"
            letterSpacing="-0.5"
            fill="#0C1412"
          >
            NIKE
          </text>
          {/* Official Nike Swoosh */}
          <path
            transform="translate(45, -1) scale(0.95)"
            fill="#0C1412"
            d="M24 7.8L6.442 15.276c-1.456.616-2.679.925-3.668.925-1.12 0-1.933-.392-2.437-1.177-.317-.504-.41-1.143-.28-1.918.13-.775.476-1.6 1.036-2.478.467-.71 1.232-1.643 2.297-2.8a6.122 6.122 0 00-.784 1.848c-.28 1.195-.028 2.072.756 2.632.373.261.886.392 1.54.392.522 0 1.11-.084 1.764-.252L24 7.8z"
          />
        </svg>
      );

    case "Adidas":
      return (
        <svg
          viewBox="0 0 76 22"
          className={className}
          aria-label="Adidas"
          role="img"
        >
          {/* Official Adidas 3 Climbing Stripes */}
          <g transform="translate(0, 1) scale(0.95)" fill="#0C1412">
            <path d="m24 19.535-8.697-15.07-4.659 2.687 7.145 12.383Zm-8.287 0L9.969 9.59 5.31 12.277l4.192 7.258ZM4.658 14.723l2.776 4.812H1.223L0 17.41Z" />
          </g>
          {/* adidas Lowercase Wordmark */}
          <text
            x="28"
            y="17"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            fontWeight="800"
            fontSize="16.5"
            letterSpacing="-0.5"
            fill="#0C1412"
          >
            adidas
          </text>
        </svg>
      );

    case "Optimum Nutrition":
      return (
        <svg
          viewBox="0 0 122 24"
          className={className}
          aria-label="Optimum Nutrition"
          role="img"
        >
          {/* Iconic ON Monogram Badge */}
          <rect x="0" y="2" width="26" height="20" rx="4" fill="#0C1412" />
          {/* 'O' shape */}
          <path
            d="M7 6.5h3.5a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4H7v-9zm2 2v5h1.5a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H9z"
            fill="#C59B27"
          />
          {/* 'N' shape */}
          <path
            d="M13.5 6.5h2.2l3.8 6v-6h2v9h-2.2l-3.8-6v6h-2v-9z"
            fill="#FFFFFF"
          />
          {/* OPTIMUM NUTRITION Wordmark */}
          <text
            x="32"
            y="12"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            fontWeight="900"
            fontSize="9"
            letterSpacing="0.8"
            fill="#0C1412"
          >
            OPTIMUM
          </text>
          <text
            x="32"
            y="20"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            fontWeight="800"
            fontSize="7.5"
            letterSpacing="1.8"
            fill="#C59B27"
          >
            NUTRITION
          </text>
        </svg>
      );

    case "MuscleTech":
      return (
        <svg
          viewBox="0 0 110 22"
          className={className}
          aria-label="MuscleTech"
          role="img"
        >
          {/* Dual Angled Chevrons */}
          <polygon points="0,17 7,17 12,5 5,5" fill="#DC2626" />
          <polygon points="8,17 15,17 20,5 13,5" fill="#0C1412" />
          {/* MUSCLETECH Italic Lockup */}
          <text
            x="22"
            y="16"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="14"
            letterSpacing="-0.3"
          >
            <tspan fill="#0C1412">MUSCLE</tspan>
            <tspan fill="#DC2626">TECH</tspan>
          </text>
        </svg>
      );

    case "Ferrero Rocher":
      return (
        <svg
          viewBox="0 0 114 24"
          className={className}
          aria-label="Ferrero Rocher"
          role="img"
        >
          {/* Royal Crown Ornament */}
          <g transform="translate(48, 0) scale(0.85)">
            <path
              d="M1 5l3.5 2.5L8 1l3.5 5.5L15 4l-1.5 6.5H2.5L1 5z"
              fill="#C59B27"
            />
            <circle cx="8" cy="1" r="1.2" fill="#C59B27" />
            <circle cx="1" cy="5" r="1" fill="#C59B27" />
            <circle cx="15" cy="4" r="1" fill="#C59B27" />
          </g>
          {/* FERRERO ROCHER Luxury Typography */}
          <text
            x="57"
            y="14"
            textAnchor="middle"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontWeight="800"
            fontSize="9"
            letterSpacing="1.2"
            fill="#8B6914"
          >
            FERRERO
          </text>
          <text
            x="57"
            y="22"
            textAnchor="middle"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontWeight="700"
            fontSize="7.5"
            letterSpacing="2.2"
            fill="#C59B27"
          >
            ROCHER
          </text>
        </svg>
      );

    case "Lindt":
      return (
        <svg
          viewBox="0 0 88 24"
          className={className}
          aria-label="Lindt"
          role="img"
        >
          {/* Swiss Dragon Crest */}
          <g transform="translate(3, 3) scale(0.7)" fill="#B8860B">
            <path d="M7 0c1.8 2.2 2.2 4.8 1.1 7-1.6 3.2-4.4 3.8-3.8 6 .6 2.2 3.3 2.2 4.4 5 1.1 2.8 0 5.5-2.2 7.2 3.3-1.1 5-3.3 4.4-6-.6-2.8-3.3-3.9-2.2-6.1 1.1-2.2 3.3-3.3 2.8-6.1-.6-2.2-2.8-4.4-4.5-7.2z" />
          </g>
          {/* Flowing Master Chocolatier Lindt Script */}
          <text
            x="18"
            y="18"
            fontFamily="'Brush Script MT', 'Bickham Script Pro', cursive, Georgia, serif"
            fontStyle="italic"
            fontWeight="bold"
            fontSize="21"
            fill="#996515"
          >
            Lindt
          </text>
        </svg>
      );

    case "Royal Medjool":
      return (
        <svg
          viewBox="0 0 108 24"
          className={className}
          aria-label="Royal Medjool"
          role="img"
        >
          {/* Luxury Crown & Date Palm Icon */}
          <g transform="translate(2, 3) scale(0.75)">
            <path
              d="M1 4l3.5 2.5L8 1l3.5 5.5L15 4l-1.5 7.5H2.5L1 4z"
              fill="#C59B27"
            />
            <circle cx="8" cy="1" r="1.2" fill="#C59B27" />
          </g>
          {/* ROYAL MEDJOOL Statuesque Typography */}
          <text
            x="20"
            y="12"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontWeight="800"
            fontSize="9"
            letterSpacing="0.8"
            fill="#074230"
          >
            ROYAL
          </text>
          <text
            x="20"
            y="20"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontWeight="700"
            fontSize="8"
            letterSpacing="1.2"
            fill="#C59B27"
          >
            MEDJOOL
          </text>
        </svg>
      );

    case "Sports Research":
      return (
        <svg
          viewBox="0 0 118 24"
          className={className}
          aria-label="Sports Research"
          role="img"
        >
          {/* Hexagon SR Shield */}
          <polygon
            points="10,2 19,6.5 19,16.5 10,21 1,16.5 1,6.5"
            fill="#074230"
          />
          <text
            x="10"
            y="15"
            textAnchor="middle"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="9.5"
            fill="#FFFFFF"
          >
            SR
          </text>
          {/* SPORTS RESEARCH Typography */}
          <text
            x="25"
            y="12"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="8.5"
            letterSpacing="0.6"
            fill="#0C1412"
          >
            SPORTS
          </text>
          <text
            x="25"
            y="20"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="800"
            fontSize="7.5"
            letterSpacing="1.4"
            fill="#0B5D44"
          >
            RESEARCH
          </text>
        </svg>
      );

    case "GNC":
      return (
        <svg
          viewBox="0 0 72 22"
          className={className}
          aria-label="GNC"
          role="img"
        >
          {/* GNC Bold Monogram */}
          <text
            x="2"
            y="17"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            fontWeight="900"
            fontSize="18"
            letterSpacing="0.5"
            fill="#0C1412"
          >
            GNC
          </text>
          {/* Red Pill Dot */}
          <circle cx="58" cy="8" r="3" fill="#DC2626" />
        </svg>
      );

    default:
      return (
        <span className="text-xs font-bold tracking-tight text-[#0C1412]">
          {brand}
        </span>
      );
  }
}
