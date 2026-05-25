import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clayos Studio Manager",
    short_name: "Clayos",
    description: "Clayos Studio 內部預約、學生、堂數與財務管理 PWA",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7ef",
    theme_color: "#4a2f24",
    orientation: "portrait",
    lang: "zh-Hant",
    categories: ["business", "productivity"],
  };
}
