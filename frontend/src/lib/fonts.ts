import localFont from "next/font/local";

export const evolventa = localFont({
  src: [
    {
      path: "../assets/fonts/Evolventa/Evolventa-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/Evolventa/Evolventa-Oblique.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../assets/fonts/Evolventa/Evolventa-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/Evolventa/Evolventa-BoldOblique.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-evolventa",
});
