import React from "react";
import { useState } from "react";
import { Link } from "wouter";
import {
  Shield, Zap, Check,
  Eye, Search, X, ShoppingCart, Lock,
  ShieldCheck, Flame, Droplets, Layers, Pipette, Sparkles,
  AlertTriangle, CheckCircle2
} from "lucide-react";
import SiteNav, { navCss } from "../components/SiteNav";
import { useAuth } from "@/contexts/AuthContext";

const SITE_URL = "https://nanoshield.com";

type FilmColorGroup = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "white" | "gray" | "black" | "brown" | "other";
type ExplorerGroup = "all" | FilmColorGroup;

type RawShade = {
  id: string; sku: string; name: string; primaryImage: string; price: number;
  urlSlug: string; group: FilmColorGroup; colorHex: string; swatchRank: number;
  includeInAll: boolean; includeInPopular: boolean;
};
type ShadeItem = RawShade & { hue: number; saturation: number; lightness: number; };

const FILM_COLOR_GROUPS: FilmColorGroup[] = ["red","orange","yellow","green","blue","purple","pink","white","gray","black","brown","other"];
const GROUP_ORDER: ExplorerGroup[] = ["all", ...FILM_COLOR_GROUPS];
const FILM_COLOR_GROUP_LABELS: Record<FilmColorGroup, string> = { red:"Red", orange:"Orange", yellow:"Yellow", green:"Green", blue:"Blue", purple:"Purple", pink:"Pink", white:"White", gray:"Gray", black:"Black", brown:"Brown", other:"Other" };
const GROUP_SORT_INDEX: Record<FilmColorGroup, number> = FILM_COLOR_GROUPS.reduce((acc, g, i) => ({ ...acc, [g]: i }), {} as Record<FilmColorGroup, number>);
const GROUP_SWATCH_BY_GROUP: Record<FilmColorGroup, string> = { red:"#DC2626", orange:"#EA580C", yellow:"#EAB308", green:"#16A34A", blue:"#2563EB", purple:"#9333EA", pink:"#DB2777", white:"#F3F4F6", gray:"#6B7280", black:"#111827", brown:"#92400E", other:"#9CA3AF" };
const FALLBACK_HEX_BY_GROUP: Record<FilmColorGroup, string> = { red:"#B91C1C", orange:"#C2410C", yellow:"#CA8A04", green:"#15803D", blue:"#1D4ED8", purple:"#7E22CE", pink:"#BE185D", white:"#E5E7EB", gray:"#6B7280", black:"#111827", brown:"#7C3F20", other:"#888888" };
const NEUTRAL_GROUPS = new Set<FilmColorGroup>(["white","gray","black","other"]);
const DEFAULT_SKU = "CS0094";
const COUNTS_BY_GROUP: Record<ExplorerGroup, number> = { all:324, red:23, orange:8, yellow:29, green:54, blue:53, purple:33, pink:12, white:16, gray:59, black:15, brown:6, other:16 };

const RAW_SHADES: RawShade[] = [
  { id:"754131b3-0de2-43c3-b53d-357774189328", sku:"CS0001", name:"Cansheng Color TPU - Crystal White", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0001.jpg", price:34300, urlSlug:"cansheng-color-tpu-crystal-white", group:"white", colorHex:"#E4E4E2", swatchRank:153, includeInAll:true, includeInPopular:false },
  { id:"335d47f2-83af-4817-bdb7-53b257267d94", sku:"CS0002", name:"Cansheng Color TPU - Oolong Milk Tea Powder", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0002.jpg", price:34300, urlSlug:"cansheng-color-tpu-oolong-milk-tea-powder", group:"brown", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"f194992a-a0af-4246-adda-f6d40149962d", sku:"CS0003", name:"Cansheng Color TPU - Beetroot Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0003.jpg", price:34300, urlSlug:"cansheng-color-tpu-beetroot-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"44d4eef7-3f12-4bd9-a616-00328f1ebdb2", sku:"CS0004", name:"Cansheng Color TPU - Ferrari Red", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0004.jpg", price:34300, urlSlug:"cansheng-color-tpu-ferrari-red", group:"red", colorHex:"#B7362C", swatchRank:7, includeInAll:false, includeInPopular:true },
  { id:"b41b1c88-acd7-46d7-b749-466cba4a1e23", sku:"CS0005", name:"Cansheng Color TPU - Chalk Grey", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0005.jpg", price:34300, urlSlug:"cansheng-color-tpu-chalk-grey", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"6f493b6d-d3c4-497a-a006-9df1122c9cd0", sku:"CS0006", name:"Cansheng Color TPU - Emerald Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0006.jpg", price:34300, urlSlug:"cansheng-color-tpu-emerald-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"5177405c-6d72-42f1-a03d-979e33263d34", sku:"CS0007", name:"Cansheng Color TPU - Metallic GT Silver", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0007.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-gt-silver", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"65e6cc42-38de-4a2b-88d7-6e5915d1874a", sku:"CS0008", name:"Cansheng Color TPU - BMW Milan Gold", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0008.jpg", price:34300, urlSlug:"cansheng-color-tpu-bmw-milan-gold", group:"yellow", colorHex:"#C5B186", swatchRank:27, includeInAll:true, includeInPopular:false },
  { id:"823ab590-a3bf-4f7a-8df1-0907fc35dbbb", sku:"CS0009", name:"Cansheng Color TPU - Racing Orange", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0009.jpg", price:34300, urlSlug:"cansheng-color-tpu-racing-orange", group:"orange", colorHex:"#E47A37", swatchRank:20, includeInAll:true, includeInPopular:true },
  { id:"09a4311a-0305-47c7-a31e-1c7c79c8e69c", sku:"CS0010", name:"Cansheng Color TPU - Danquan Stone Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0010.jpg", price:34300, urlSlug:"cansheng-color-tpu-danquan-stone-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"74e3a0da-89d1-4b2b-a2c5-633cf1bf33d6", sku:"CS0011", name:"Cansheng Color TPU - Red Diamond", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0011.jpg", price:34300, urlSlug:"cansheng-color-tpu-red-diamond", group:"red", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"a63f64d1-af53-4490-b15a-7b7d7b692390", sku:"CS0012", name:"Cansheng Color TPU - Gold Diamond", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0012.jpg", price:34300, urlSlug:"cansheng-color-tpu-gold-diamond", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"c227c77c-1e06-4feb-b8ca-945b3eb86e55", sku:"CS0013", name:"Cansheng Color TPU - Green Diamond", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0013.jpg", price:34300, urlSlug:"cansheng-color-tpu-green-diamond", group:"green", colorHex:"#D6D6C7", swatchRank:42, includeInAll:true, includeInPopular:false },
  { id:"d97c556e-8b7c-4096-ab65-950f35556c2e", sku:"CS0014", name:"Cansheng Color TPU - Purple Diamond", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0014.jpg", price:34300, urlSlug:"cansheng-color-tpu-purple-diamond", group:"purple", colorHex:"#DADCCD", swatchRank:44, includeInAll:true, includeInPopular:false },
  { id:"c78a96f7-2f43-4a95-91a3-a95b0fdf5100", sku:"CS0015", name:"Cansheng Color TPU - White to Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0015.jpg", price:34300, urlSlug:"cansheng-color-tpu-white-to-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"0259fe2a-f1e2-458a-874c-78c0b6c70f53", sku:"CS0016", name:"Cansheng Color TPU - Diamond White Pink", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0016.jpg", price:34300, urlSlug:"cansheng-color-tpu-diamond-white-pink", group:"pink", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"6136d5a8-543d-45b5-9999-58a08db488ec", sku:"CS0017", name:"Cansheng Color TPU - Diamond White Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0017.jpg", price:34300, urlSlug:"cansheng-color-tpu-diamond-white-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"6869a0fa-8b72-41d0-a540-4a3980dc8245", sku:"CS0018", name:"Cansheng Color TPU - Bright Moon White", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0018.jpg", price:34300, urlSlug:"cansheng-color-tpu-bright-moon-white", group:"white", colorHex:"#D6D7CF", swatchRank:155, includeInAll:true, includeInPopular:false },
  { id:"307ce191-fe76-4260-b99e-b2a3c86fd529", sku:"CS0019", name:"Cansheng Color TPU - White Gold", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0019.jpg", price:34300, urlSlug:"cansheng-color-tpu-white-gold", group:"white", colorHex:"#D8DAD5", swatchRank:156, includeInAll:true, includeInPopular:false },
  { id:"011eb8e0-f2f9-4123-ba4f-8d63a88da87b", sku:"CS0020", name:"Cansheng Color TPU - AMG Mountain Ash", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0020.jpg", price:34300, urlSlug:"cansheng-color-tpu-amg-mountain-ash", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"cf55c2a6-2b3d-4f6a-813f-6e991ad85390", sku:"CS0021", name:"Cansheng Color TPU - Metal Midnight Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0021.jpg", price:34300, urlSlug:"cansheng-color-tpu-metal-midnight-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"1a1358e6-c4a3-4254-8944-5c652beb2fa0", sku:"CS0022", name:"Cansheng Color TPU - Liquid Metallic Dragon\'s Blood Red", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0022.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-dragon-s-blood-red", group:"red", colorHex:"#704C4C", swatchRank:1, includeInAll:true, includeInPopular:true },
  { id:"95f8e5de-9a4b-403f-a4be-857d00517669", sku:"CS0023", name:"Cansheng Color TPU - Liquid Metallic Silver", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0023.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-silver", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"2c7f3974-f57a-4650-a130-889bc670cdc0", sku:"CS0024", name:"Cansheng Color TPU - Cuban Sand", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0024.jpg", price:34300, urlSlug:"cansheng-color-tpu-cuban-sand", group:"brown", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"95422557-b072-4923-9d2f-d926e819ff89", sku:"CS0025", name:"Cansheng Color TPU - Mist Grayish Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0025.jpg", price:34300, urlSlug:"cansheng-color-tpu-mist-grayish-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"52c7aa83-fe9a-4309-937a-1b563ffb42a7", sku:"CS0026", name:"Cansheng Color TPU - Lavender Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0026.jpg", price:34300, urlSlug:"cansheng-color-tpu-lavender-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"8f89968d-80db-403c-a4f4-1e62cad93aba", sku:"CS0027", name:"Cansheng Color TPU - Glossy Khaki Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0027.jpg", price:34300, urlSlug:"cansheng-color-tpu-glossy-khaki-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"e7e72f0c-adbf-401c-9007-225499c1c6be", sku:"CS0028", name:"Cansheng Color TPU - Sky Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0028.jpg", price:34300, urlSlug:"cansheng-color-tpu-sky-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"4fccd3c9-85f1-4f01-9c8f-37325e7ccb8e", sku:"CS0029", name:"Cansheng Color TPU - Autumn Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0029.jpg", price:34300, urlSlug:"cansheng-color-tpu-autumn-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"9ca7c52c-c4bf-4619-a137-5b12dcc90b85", sku:"CS0030", name:"Cansheng Color TPU - Glossy Cement Grey", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0030.jpg", price:34300, urlSlug:"cansheng-color-tpu-glossy-cement-grey", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"655eb255-5e35-4215-89a4-7b921abc3d02", sku:"CS0031", name:"Cansheng Color TPU - Jade White", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0031.jpg", price:34300, urlSlug:"cansheng-color-tpu-jade-white", group:"green", colorHex:"#E2E4DA", swatchRank:47, includeInAll:true, includeInPopular:false },
  { id:"ea3770d8-1206-4615-9016-05fc4f1dea8d", sku:"CS0032", name:"Cansheng Color TPU - Blue Charm Gold", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0032.jpg", price:34300, urlSlug:"cansheng-color-tpu-blue-charm-gold", group:"blue", colorHex:"#B3CAC8", swatchRank:75, includeInAll:true, includeInPopular:false },
  { id:"7a7e095d-fa79-4e58-8ac0-57b61b97be11", sku:"CS0033", name:"Cansheng Color TPU - Moonlight Jade Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0033.jpg", price:34300, urlSlug:"cansheng-color-tpu-moonlight-jade-purple", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"6a44691e-be28-4233-bc66-a81682b4e3d2", sku:"CS0034", name:"Cansheng Color TPU - Laser White", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0034.jpg", price:34300, urlSlug:"cansheng-color-tpu-laser-white", group:"white", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"e0ff5f35-8089-45af-bb46-0838fd453c5d", sku:"CS0035", name:"Cansheng Color TPU - Flame Copper Brown", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0035.jpg", price:34300, urlSlug:"cansheng-color-tpu-flame-copper-brown", group:"orange", colorHex:"#F4AB79", swatchRank:22, includeInAll:false, includeInPopular:true },
  { id:"45cff744-38f5-481f-b2b8-2635867cf158", sku:"CS0036", name:"Cansheng Color TPU - Soft Light Pink", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0036.jpg", price:34300, urlSlug:"cansheng-color-tpu-soft-light-pink", group:"pink", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"cce12d14-dc40-4b08-90a9-c9336cc95314", sku:"CS0037", name:"Cansheng Color TPU - Laser Carmine Powder", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0037.jpg", price:34300, urlSlug:"cansheng-color-tpu-laser-carmine-powder", group:"other", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"a3b52f56-a9a3-4f7d-a4f0-474e3084f769", sku:"CS0038", name:"Cansheng Color TPU - Dream Rouge Powder", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0038.jpg", price:34300, urlSlug:"cansheng-color-tpu-dream-rouge-powder", group:"red", colorHex:"#DEC3BC", swatchRank:10, includeInAll:false, includeInPopular:true },
  { id:"871a3348-8164-49e5-bd51-c3b32260c1e8", sku:"CS0039", name:"Cansheng Color TPU - Fantastic Grey", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0039.jpg", price:34300, urlSlug:"cansheng-color-tpu-fantastic-grey", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"e7f94130-d642-4ec3-bd90-ee2962dddbc3", sku:"CS0040", name:"Cansheng Color TPU - Metallic Crystal Bronze", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0040.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-crystal-bronze", group:"white", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"5d09afa9-a3cd-427b-8157-fab99a5a9cba", sku:"CS0041", name:"Cansheng Color TPU - Blush Pearl", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0041.jpg", price:34300, urlSlug:"cansheng-color-tpu-blush-pearl", group:"pink", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"3a1d057e-c34d-49a2-afa2-602b5070b80a", sku:"CS0042", name:"Cansheng Color TPU - Magic Flame Gold Red", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0042.jpg", price:34300, urlSlug:"cansheng-color-tpu-magic-flame-gold-red", group:"red", colorHex:"#B4363A", swatchRank:15, includeInAll:false, includeInPopular:true },
  { id:"559be37c-2006-4ef5-bd2d-e6c420966db5", sku:"CS0043", name:"Cansheng Color TPU - Manta Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0043.jpg", price:34300, urlSlug:"cansheng-color-tpu-manta-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"9996b0d6-d801-4380-855e-3b3a2d3711a8", sku:"CS0044", name:"Cansheng Color TPU - Metallic Paint Star Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0044.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-paint-star-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"a236799f-d670-4acd-beee-9f2d81d76cdd", sku:"CS0045", name:"Cansheng Color TPU - Metallic Crystal Silver Phantom Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0045.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-crystal-silver-phantom-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"1eed7264-79ba-4ac4-ab8d-306b79785d25", sku:"CS0046", name:"Cansheng Color TPU - Fantastic Gray Phantom Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0046.jpg", price:34300, urlSlug:"cansheng-color-tpu-fantastic-gray-phantom-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"f90c96b0-3d5d-44fb-a69c-22400e560fbd", sku:"CS0047", name:"Cansheng Color TPU - Rosemary Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0047.jpg", price:34300, urlSlug:"cansheng-color-tpu-rosemary-purple", group:"purple", colorHex:"#7783B8", swatchRank:131, includeInAll:true, includeInPopular:false },
  { id:"505a8555-4929-4024-be25-33eb7ed6111a", sku:"CS0048", name:"Cansheng Color TPU - Victoria\'s Secret Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0048.jpg", price:34300, urlSlug:"cansheng-color-tpu-victoria-s-secret-purple", group:"purple", colorHex:"#899AD2", swatchRank:129, includeInAll:true, includeInPopular:false },
  { id:"734f0f9b-ceb6-4e6a-a3e4-736887e02cb9", sku:"CS0049", name:"Cansheng Color TPU - Tiffany Pink", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0049.jpg", price:34300, urlSlug:"cansheng-color-tpu-tiffany-pink", group:"pink", colorHex:"#92CFC6", swatchRank:70, includeInAll:true, includeInPopular:false },
  { id:"332767ff-2d1e-4a77-908f-21de0e4ee313", sku:"CS0050", name:"Cansheng Color TPU - Paint Fantastic Turquoise Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0050.jpg", price:34300, urlSlug:"cansheng-color-tpu-paint-fantastic-turquoise-gray", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"95c98af6-2513-47a8-895f-66a59958e6f1", sku:"CS0051", name:"Cansheng Color TPU - Jade Elegant Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0051.jpg", price:34300, urlSlug:"cansheng-color-tpu-jade-elegant-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"439dd24d-1c02-42d7-aeeb-6f1907d39b4e", sku:"CS0052", name:"Cansheng Color TPU - Oak Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0052.jpg", price:34300, urlSlug:"cansheng-color-tpu-oak-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"3336feec-8fbb-4079-a62d-fbb8df1eae5f", sku:"CS0053", name:"Cansheng Color TPU - Royal Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0053.jpg", price:34300, urlSlug:"cansheng-color-tpu-royal-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"643865cf-bf47-4a3d-b95e-b1ef4ed39a99", sku:"CS0054", name:"Cansheng Color TPU - Metallic Paint Glacier Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0054.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-paint-glacier-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"28c96757-43f5-4b1b-8892-fe49988b6775", sku:"CS0055", name:"Cansheng Color TPU - Metallic Mist Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0055.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-mist-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"5164a7d0-cccb-4636-8320-f527ca4a697f", sku:"CS0056", name:"Cansheng Color TPU - Zandvoort Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0056.jpg", price:34300, urlSlug:"cansheng-color-tpu-zandvoort-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"2a28b533-d1b3-49a9-a547-2c5e0cbee865", sku:"CS0057", name:"Cansheng Color TPU - Canel Bay Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0057.jpg", price:34300, urlSlug:"cansheng-color-tpu-canel-bay-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"760027ea-17ea-4428-96e0-2eb3c3ed2955", sku:"CS0058", name:"Cansheng Color TPU - Sapphire", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0058.jpg", price:34300, urlSlug:"cansheng-color-tpu-sapphire", group:"other", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"b0750ffc-cff9-4461-8276-139bb418034e", sku:"CS0059", name:"Cansheng Color TPU - Metallic Montego Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0059.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-montego-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"c0ccab03-aa5d-4346-bffe-e70ab32e12a3", sku:"CS0060", name:"Cansheng Color TPU - Reflective Shining Silver", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0060.jpg", price:34300, urlSlug:"cansheng-color-tpu-reflective-shining-silver", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"f78f6459-413b-41c2-b36c-f1cdd80332a4", sku:"CS0061", name:"Cansheng Color TPU - Metallic Silver", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0061.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-silver", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"dbc64561-b830-4338-b20e-b5228680623b", sku:"CS0062", name:"Cansheng Color TPU - Sky Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0062.jpg", price:34300, urlSlug:"cansheng-color-tpu-sky-gray", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"e21a76bb-97db-4cd0-9ef8-5d2489cff821", sku:"CS0063", name:"Cansheng Color TPU - Metal Black Rose", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0063.jpg", price:34300, urlSlug:"cansheng-color-tpu-metal-black-rose", group:"pink", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"3ea18b22-01d2-4668-8b7e-01d008c1087e", sku:"CS0064", name:"Cansheng Color TPU - Laser Black", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0064.jpg", price:34300, urlSlug:"cansheng-color-tpu-laser-black", group:"black", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"fb987540-f2d7-4bde-906f-c6722491d67b", sku:"CS0065", name:"Cansheng Color TPU - Pearlescent Black", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0065.jpg", price:34300, urlSlug:"cansheng-color-tpu-pearlescent-black", group:"white", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"c8543254-19db-4cb8-a180-c43b2d138f81", sku:"CS0066", name:"Cansheng Color TPU - Diamond White Charm Gold", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0066.jpg", price:34300, urlSlug:"cansheng-color-tpu-diamond-white-charm-gold", group:"blue", colorHex:"#E2EEED", swatchRank:76, includeInAll:true, includeInPopular:false },
  { id:"9c568b16-e610-4261-babf-8950e97d3792", sku:"CS0067", name:"Cansheng Color TPU - Super Bright Black Magic Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0067.jpg", price:34300, urlSlug:"cansheng-color-tpu-super-bright-black-magic-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"69ac85a4-863e-425e-a490-a3c344f5bd7d", sku:"CS0068", name:"Cansheng Color TPU - Metal Mountain Grey", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0068.jpg", price:34300, urlSlug:"cansheng-color-tpu-metal-mountain-grey", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"89a3e362-65b3-409c-9f7b-57d1805a7259", sku:"CS0069", name:"Cansheng Color TPU - Super Matte White", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0069.jpg", price:34300, urlSlug:"cansheng-color-tpu-super-matte-white", group:"white", colorHex:"#E5E5E0", swatchRank:154, includeInAll:true, includeInPopular:false },
  { id:"3994c03e-10ec-4a0e-94b5-270afa01d06b", sku:"CS0070", name:"Cansheng Color TPU - Super Matte Black", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0070.jpg", price:34300, urlSlug:"cansheng-color-tpu-super-matte-black", group:"black", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"ff08561f-79b7-4735-97d1-d184cf19af76", sku:"CS0071", name:"Cansheng Color TPU - Lava Orange(Xiaomi)", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0071.jpg", price:34300, urlSlug:"cansheng-color-tpu-lava-orange-xiaomi", group:"orange", colorHex:"#CB6544", swatchRank:11, includeInAll:true, includeInPopular:true },
  { id:"e5ebe662-0aae-4961-8281-0e00d58db50b", sku:"CS0072", name:"Cansheng Color TPU - Flowing Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0072.jpg", price:34300, urlSlug:"cansheng-color-tpu-flowing-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"c694f49a-3769-49bc-9aee-8fce1ca4d257", sku:"CS0073", name:"Cansheng Color TPU - Rays Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0073.jpg", price:34300, urlSlug:"cansheng-color-tpu-rays-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"a69e2181-6edf-441f-b72e-0fa0b41e0590", sku:"CS0074", name:"Cansheng Color TPU - Dark Agate", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0074.jpg", price:34300, urlSlug:"cansheng-color-tpu-dark-agate", group:"gray", colorHex:"#585655", swatchRank:164, includeInAll:true, includeInPopular:false },
  { id:"ba3b85f4-555d-4550-9345-192ddcb0eea4", sku:"CS0075", name:"Cansheng Color TPU - Spirit Mirror Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0075.jpg", price:34300, urlSlug:"cansheng-color-tpu-spirit-mirror-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"9311e7b5-6231-4a15-ba0c-d9b487369ca7", sku:"CS0076", name:"Cansheng Color TPU - Galaxy Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0076.jpg", price:34300, urlSlug:"cansheng-color-tpu-galaxy-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"39a47e50-db77-49b1-ae60-0013a6f7e1fa", sku:"CS0077", name:"Cansheng Color TPU - Aurora Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0077.jpg", price:34300, urlSlug:"cansheng-color-tpu-aurora-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"72f45fb6-4866-4c9f-bac7-6d83dc3d940d", sku:"CS0078", name:"Cansheng Color TPU - Dawn Gold", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0078.jpg", price:34300, urlSlug:"cansheng-color-tpu-dawn-gold", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"0c673f9b-a5a0-4b41-9a5d-23f3738b2dd8", sku:"CS0079", name:"Cansheng Color TPU - Metallic Paint Antarctic Star Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0079.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-paint-antarctic-star-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"27784614-a012-4448-a63c-3697fc114e1f", sku:"CS0080", name:"Cansheng Color TPU - Cream Yellow", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0080.jpg", price:34300, urlSlug:"cansheng-color-tpu-cream-yellow", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"41bbd7f7-1e23-4862-8793-3a1feb844b36", sku:"CS0081", name:"Cansheng Color TPU - Cloudy Yellow", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0081.jpg", price:34300, urlSlug:"cansheng-color-tpu-cloudy-yellow", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"9157e7e3-6a37-429c-ab6d-8d28fddf1d06", sku:"CS0082", name:"Cansheng Color TPU - Mirror Vacuum Powder", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0082.jpg", price:34300, urlSlug:"cansheng-color-tpu-mirror-vacuum-powder", group:"gray", colorHex:"#BFB5AE", swatchRank:167, includeInAll:true, includeInPopular:false },
  { id:"d7c5dd4a-ef2d-4414-9e04-b61715ff44e3", sku:"CS0083", name:"Cansheng Color TPU - Dawn Mist Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0083.jpg", price:34300, urlSlug:"cansheng-color-tpu-dawn-mist-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"386460b6-9bb1-43cb-9dac-0036a4dd4205", sku:"CS0084", name:"Cansheng Color TPU - Crimson Red T", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0084.jpg", price:34300, urlSlug:"cansheng-color-tpu-crimson-red-t", group:"red", colorHex:"#794E4D", swatchRank:3, includeInAll:true, includeInPopular:true },
  { id:"adfddafa-e66a-4611-9df5-9ce1e812acb8", sku:"CS0085", name:"Cansheng Color TPU - Forest Green T", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0085.jpg", price:34300, urlSlug:"cansheng-color-tpu-forest-green-t", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"a18df603-2590-43e1-a65c-f5da461697ad", sku:"CS0086", name:"Cansheng Color TPU - Glacier Blue T", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0086.jpg", price:34300, urlSlug:"cansheng-color-tpu-glacier-blue-t", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"642ba606-a873-429d-b81c-670fbaee6de7", sku:"CS0087", name:"Cansheng Color TPU - Slip Grey T", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0087.jpg", price:34300, urlSlug:"cansheng-color-tpu-slip-grey-t", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"398b9391-c161-46c5-8ee0-3244b0e753f6", sku:"CS0088", name:"Cansheng Color TPU - Glossy Sea Breeze Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0088.jpg", price:34300, urlSlug:"cansheng-color-tpu-glossy-sea-breeze-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"d237ab14-e1be-4c5c-8d31-25e852340fb9", sku:"CS0089", name:"Cansheng Color TPU - Volcanic Yellow", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0089.jpg", price:34300, urlSlug:"cansheng-color-tpu-volcanic-yellow", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"225978a7-e704-4637-be7e-26d9ac70eae1", sku:"CS0090", name:"Cansheng Color TPU - Marvelli Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0090.jpg", price:34300, urlSlug:"cansheng-color-tpu-marvelli-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"a443eeba-d270-4758-afe7-c7766096df94", sku:"CS0091", name:"Cansheng Color TPU - Aquila Metal", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0091.jpg", price:34300, urlSlug:"cansheng-color-tpu-aquila-metal", group:"other", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"45953b42-02da-46e3-a261-cd0cc37545bf", sku:"CS0092", name:"Cansheng Color TPU - McLaren Orange", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0092.jpg", price:34300, urlSlug:"cansheng-color-tpu-mclaren-orange", group:"orange", colorHex:"#F29428", swatchRank:24, includeInAll:false, includeInPopular:true },
  { id:"1d5adb63-9b32-4f16-83c6-a01e64ce3205", sku:"CS0093", name:"Cansheng Color TPU - Tiffany", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0093.jpg", price:34300, urlSlug:"cansheng-color-tpu-tiffany", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"51949a38-9c3a-4aec-9771-627190fc701e", sku:"CS0094", name:"Cansheng Color TPU - Soul Red", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0094.jpg", price:34300, urlSlug:"cansheng-color-tpu-soul-red", group:"red", colorHex:"#A8403E", swatchRank:2, includeInAll:true, includeInPopular:true },
  { id:"82186a49-78f8-49c7-89f0-2bf2fbc9295a", sku:"CS0095", name:"Cansheng Color TPU - Byron Bay Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0095.jpg", price:34300, urlSlug:"cansheng-color-tpu-byron-bay-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"36996c58-be28-4404-b13b-fcda426e03df", sku:"CS0096", name:"Cansheng Color TPU - Santorini Black", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0096.jpg", price:34300, urlSlug:"cansheng-color-tpu-santorini-black", group:"black", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"373dde01-38aa-4686-b97e-2e6376fb4bfc", sku:"CS0097", name:"Cansheng Color TPU - Tuscany Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0097.jpg", price:34300, urlSlug:"cansheng-color-tpu-tuscany-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"06c4e5d7-a26f-4eea-81bf-67a37f8f7004", sku:"CS0098", name:"Cansheng Color TPU - Venice Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0098.jpg", price:34300, urlSlug:"cansheng-color-tpu-venice-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"043a4d01-22de-45f2-8c0a-e7c3c4a06107", sku:"CS0099", name:"Cansheng Color TPU - Repair Pearl White", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0099.jpg", price:34300, urlSlug:"cansheng-color-tpu-repair-pearl-white", group:"white", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"692f450a-e790-4550-b4aa-834b9c9de712", sku:"CS0100", name:"Cansheng Color TPU - Morganite Pink", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0100.jpg", price:34300, urlSlug:"cansheng-color-tpu-morganite-pink", group:"pink", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"a03e5af0-a648-4dba-9cb8-620ed2d28853", sku:"CS0101", name:"Cansheng Color TPU - Amethyst", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0101.jpg", price:34300, urlSlug:"cansheng-color-tpu-amethyst", group:"other", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"705e12d4-c96c-48d5-8bc3-f6fafb5bb9ef", sku:"CS0102", name:"Cansheng Color TPU - Muriwai White", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0102.jpg", price:34300, urlSlug:"cansheng-color-tpu-muriwai-white", group:"white", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"71eb8dfc-d720-4096-8a43-92d56decfc64", sku:"CS0103", name:"Cansheng Color TPU - Star Sky Phantom Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0103.jpg", price:34300, urlSlug:"cansheng-color-tpu-star-sky-phantom-gray", group:"gray", colorHex:"#797170", swatchRank:161, includeInAll:true, includeInPopular:false },
  { id:"dd6cb3c2-9804-463d-8cf7-097472052d13", sku:"CS0104", name:"Cansheng Color TPU - Black Cherry Wine", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0104.jpg", price:34300, urlSlug:"cansheng-color-tpu-black-cherry-wine", group:"red", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"bfdc5369-f466-4548-8909-030f60e2f4cf", sku:"CS0105", name:"Cansheng Color TPU - Lyrical Bronze", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0105.jpg", price:34300, urlSlug:"cansheng-color-tpu-lyrical-bronze", group:"other", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"cd504a32-d987-4f54-ba87-12688f48c0e2", sku:"CS0106", name:"Cansheng Color TPU - Saga Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0106.jpg", price:34300, urlSlug:"cansheng-color-tpu-saga-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"65ac8831-a84c-486d-b91c-d385865a025d", sku:"CS0107", name:"Cansheng Color TPU - Explosion Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0107.jpg", price:34300, urlSlug:"cansheng-color-tpu-explosion-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"58ff2362-9a4f-4276-b79f-5e0774450c25", sku:"CS0108", name:"Cansheng Color TPU - Sunflower Yellow", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0108.jpg", price:34300, urlSlug:"cansheng-color-tpu-sunflower-yellow", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"ef3b3eed-2656-49e3-96b5-95f250fe5c30", sku:"CS0109", name:"Cansheng Color TPU - Cherry Pollen", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0109.jpg", price:34300, urlSlug:"cansheng-color-tpu-cherry-pollen", group:"red", colorHex:"#CCB6A8", swatchRank:21, includeInAll:false, includeInPopular:true },
  { id:"d0e4364f-3a5e-43ab-a6fe-5804192ee734", sku:"CS0110", name:"Cansheng Color TPU - Carnation Pink", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0110.jpg", price:34300, urlSlug:"cansheng-color-tpu-carnation-pink", group:"pink", colorHex:"#D6A593", swatchRank:17, includeInAll:true, includeInPopular:true },
  { id:"2b4f1279-8f7a-4204-9e9c-d6f0c125a07c", sku:"CS0111", name:"Cansheng Color TPU - Mary Kay Pink", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0111.jpg", price:34300, urlSlug:"cansheng-color-tpu-mary-kay-pink", group:"pink", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"c142fb13-2c64-43b7-98a4-d910fd9dcef6", sku:"CS0112", name:"Cansheng Color TPU - Aka Gold", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0112.jpg", price:34300, urlSlug:"cansheng-color-tpu-aka-gold", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"f9391e74-8770-4f84-9789-ee3f005230ac", sku:"CS0113", name:"Cansheng Color TPU - Modena Yellow", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0113.jpg", price:34300, urlSlug:"cansheng-color-tpu-modena-yellow", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"13b106db-a081-473c-8488-61e96880b95c", sku:"CS0114", name:"Cansheng Color TPU - Renovatting Ferrari Red", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0114.jpg", price:34300, urlSlug:"cansheng-color-tpu-renovatting-ferrari-red", group:"red", colorHex:"#D5403C", swatchRank:4, includeInAll:true, includeInPopular:true },
  { id:"f5950f92-4a34-479b-97d2-84497702e02d", sku:"CS0115", name:"Cansheng Color TPU - Francesca Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0115.jpg", price:34300, urlSlug:"cansheng-color-tpu-francesca-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"3541647b-e2d1-4c51-bdeb-7f753ff2062d", sku:"CS0116", name:"Cansheng Color TPU - Grey Violet", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0116.jpg", price:34300, urlSlug:"cansheng-color-tpu-grey-violet", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"536917e5-d7bb-4e49-b63e-8c54c242406e", sku:"CS0117", name:"Cansheng Color TPU - Metallic High Mountain Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0117.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-high-mountain-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"615b5d34-92af-449f-a2e8-e457062c4f77", sku:"CS0118", name:"Cansheng Color TPU - Paint Coal Grey", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0118.jpg", price:34300, urlSlug:"cansheng-color-tpu-paint-coal-grey", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"c2a41dde-28b1-4589-ae00-decb2434e219", sku:"CS0119", name:"Cansheng Color TPU - Vintage Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0119.jpg", price:34300, urlSlug:"cansheng-color-tpu-vintage-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"eabc8cc6-20e2-445e-9ade-12b69ec3f723", sku:"CS0120", name:"Cansheng Color TPU - Dark Emerald Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0120.jpg", price:34300, urlSlug:"cansheng-color-tpu-dark-emerald-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"49399e13-e2e1-4d0f-8719-7752aed9cd3b", sku:"CS0121", name:"Cansheng Color TPU - Glacial Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0121.jpg", price:34300, urlSlug:"cansheng-color-tpu-glacial-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"ec5f4c47-8a7a-41f5-8f49-31c1d4543575", sku:"CS0122", name:"Cansheng Color TPU - Glacier Blue C", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0122.jpg", price:34300, urlSlug:"cansheng-color-tpu-glacier-blue-c", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"3af2dcf4-092b-4ae2-87b0-9d628fc6939e", sku:"CS0123", name:"Cansheng Color TPU - Pearl White", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0123.jpg", price:34300, urlSlug:"cansheng-color-tpu-pearl-white", group:"white", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"e0cd425f-2153-4c79-8a6b-0361e86c7c9a", sku:"CS0124", name:"Cansheng Color TPU - Paint Chocolate", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0124.jpg", price:34300, urlSlug:"cansheng-color-tpu-paint-chocolate", group:"brown", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"b7080c07-c27f-480e-be7b-661bba542629", sku:"CS0125", name:"Cansheng Color TPU - GT Violet", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0125.jpg", price:34300, urlSlug:"cansheng-color-tpu-gt-violet", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"f04f2c8c-a149-41cb-aaf2-0d6af9f237ee", sku:"CS0126", name:"Cansheng Color TPU - Pine Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0126.jpg", price:34300, urlSlug:"cansheng-color-tpu-pine-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"c00c82fd-6d4e-44fd-9e99-ac6f9a3996ff", sku:"CS0127", name:"Cansheng Color TPU - Original Champagne Gold", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0127.jpg", price:34300, urlSlug:"cansheng-color-tpu-original-champagne-gold", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"dae66231-d9a7-4b62-a693-4501642574bd", sku:"CS0128", name:"Cansheng Color TPU - Emerald", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0128.jpg", price:34300, urlSlug:"cansheng-color-tpu-emerald", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"be3b38f1-0173-427c-963b-fc984a5192a2", sku:"CS0129", name:"Cansheng Color TPU - Thousand Mountain Cui", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0129.jpg", price:34300, urlSlug:"cansheng-color-tpu-thousand-mountain-cui", group:"brown", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"177bcf1b-faf7-4791-9293-6a963e31a836", sku:"CS0130", name:"Cansheng Color TPU - Champagne Gold", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0130.jpg", price:34300, urlSlug:"cansheng-color-tpu-champagne-gold", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"18a99f8c-c390-4dca-b286-9463560ac101", sku:"CS0131", name:"Cansheng Color TPU - Metallic Paint Champagne Gold", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0131.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-paint-champagne-gold", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"1b8ce6bc-6078-4eec-903e-97dea7ef61b1", sku:"CS0132", name:"Cansheng Color TPU - Arabic Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0132.jpg", price:34300, urlSlug:"cansheng-color-tpu-arabic-gray", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"3a974676-bbc5-4d89-9698-24101f0dd617", sku:"CS0133", name:"Cansheng Color TPU - Moonlight Stone Grey", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0133.jpg", price:34300, urlSlug:"cansheng-color-tpu-moonlight-stone-grey", group:"white", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"c2a60d63-b97d-47d2-a255-2061f96e9ac9", sku:"CS0134", name:"Cansheng Color TPU - Bright Black", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0134.jpg", price:34300, urlSlug:"cansheng-color-tpu-bright-black", group:"black", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"44e35a31-29f9-47b7-b2a1-549864e61c03", sku:"CS0135", name:"Cansheng Color TPU - Metallic Black", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0135.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-black", group:"black", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"b30d2b77-d58d-44e1-a018-35008df4e46f", sku:"CS0136", name:"Cansheng Color TPU - Obsidian Black", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0136.jpg", price:34300, urlSlug:"cansheng-color-tpu-obsidian-black", group:"black", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"baca4d0c-7ecf-4fd7-8952-5ac452a31add", sku:"CS0137", name:"Cansheng Color TPU - Flowing Starry Silver", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0137.jpg", price:34300, urlSlug:"cansheng-color-tpu-flowing-starry-silver", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"78b4a650-83d5-416e-9a0f-ae15935be731", sku:"CS0138", name:"Cansheng Color TPU - Sahara Yellow", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0138.jpg", price:34300, urlSlug:"cansheng-color-tpu-sahara-yellow", group:"yellow", colorHex:"#CAC2A7", swatchRank:29, includeInAll:true, includeInPopular:false },
  { id:"d6813f50-3552-4f38-8078-56d51a4e26c6", sku:"CS0139", name:"Cansheng Color TPU - Desert Storm (Mercedes-Benz)", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0139.jpg", price:34300, urlSlug:"cansheng-color-tpu-desert-storm-mercedes-benz", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"37ee2bcc-8769-4ae0-a3db-fc3d3dc1c25d", sku:"CS0140", name:"Cansheng Color TPU - Desert Yellow", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0140.jpg", price:34300, urlSlug:"cansheng-color-tpu-desert-yellow", group:"yellow", colorHex:"#A69461", swatchRank:28, includeInAll:true, includeInPopular:false },
  { id:"329e2b85-dd03-469d-9f16-781fcd8ef068", sku:"CS0141", name:"Cansheng Color TPU - Original Desert Yellow", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0141.jpg", price:34300, urlSlug:"cansheng-color-tpu-original-desert-yellow", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"e63cf7a8-36c8-4a37-9699-82fad0be245c", sku:"CS0142", name:"Cansheng Color TPU - Porcelain Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0142.jpg", price:34300, urlSlug:"cansheng-color-tpu-porcelain-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"fdaef202-2c39-4d70-801e-a6f389c66883", sku:"CS0143", name:"Cansheng Color TPU - Volcanic Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0143.jpg", price:34300, urlSlug:"cansheng-color-tpu-volcanic-gray", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"3f20f810-bd94-4c6a-813b-ace613c26748", sku:"CS0144", name:"Cansheng Color TPU - Late Night Black", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0144.jpg", price:34300, urlSlug:"cansheng-color-tpu-late-night-black", group:"black", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"3380c542-dc01-4a62-9c48-90a7d41023e5", sku:"CS0145", name:"Cansheng Color TPU - Papaiya Orange", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0145.jpg", price:34300, urlSlug:"cansheng-color-tpu-papaiya-orange", group:"orange", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"388a50c8-23a4-4de7-9572-0bc067843195", sku:"CS0146", name:"Cansheng Color TPU - Madeira Metallic Gold", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0146.jpg", price:34300, urlSlug:"cansheng-color-tpu-madeira-metallic-gold", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"ae3a8c71-5edf-4c85-a6fc-093907b1f418", sku:"CS0147", name:"Cansheng Color TPU - Ice Strawberry Pink", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0147.jpg", price:34300, urlSlug:"cansheng-color-tpu-ice-strawberry-pink", group:"pink", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"5cf7100a-214f-46aa-9ba2-e98cc61a9d12", sku:"CS0148", name:"Cansheng Color TPU - Colored Glaze Tata Red", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0148.jpg", price:34300, urlSlug:"cansheng-color-tpu-colored-glaze-tata-red", group:"red", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"60dd9d83-cf2f-428c-ad8c-cd2407f38d64", sku:"CS0149", name:"Cansheng Color TPU - Mahogany", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0149.jpg", price:34300, urlSlug:"cansheng-color-tpu-mahogany", group:"gray", colorHex:"#464341", swatchRank:166, includeInAll:true, includeInPopular:false },
  { id:"26f012f3-da73-43e5-90cb-8170ec42ccbd", sku:"CS0150", name:"Cansheng Color TPU - Metallic Amethyst", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0150.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-amethyst", group:"other", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"2d8439e3-0205-4e26-885e-a25aa0c873ff", sku:"CS0151", name:"Cansheng Color TPU - Cuprite", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0151.jpg", price:34300, urlSlug:"cansheng-color-tpu-cuprite", group:"other", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"699ea166-895e-414c-a8a0-9fcbc36e3131", sku:"CS0152", name:"Cansheng Color TPU - Metallic Leblon Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0152.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-leblon-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"192b3268-2ae3-4d0c-91f5-a2deb1529409", sku:"CS0153", name:"Cansheng Color TPU - Fantasy Fluorescent Yellow", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0153.jpg", price:34300, urlSlug:"cansheng-color-tpu-fantasy-fluorescent-yellow", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"2e5cffdc-e850-4bb4-badb-b82877833039", sku:"CS0154", name:"Cansheng Color TPU - Fantasy Gold Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0154.jpg", price:34300, urlSlug:"cansheng-color-tpu-fantasy-gold-green", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"f2fd5bf8-8bc4-4c32-9f3e-467aab74c23e", sku:"CS0155", name:"Cansheng Color TPU - Racing Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0155.jpg", price:34300, urlSlug:"cansheng-color-tpu-racing-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"3babe237-650e-4f43-a8d5-a7d015ca41ed", sku:"CS0156", name:"Cansheng Color TPU - Olive Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0156.jpg", price:34300, urlSlug:"cansheng-color-tpu-olive-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"c842b4ac-0766-4708-9cca-e116991d3842", sku:"CS0157", name:"Cansheng Color TPU - Metallic Aventurine Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0157.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-aventurine-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"b21e6a84-2ed1-4cac-a05e-faa43ee377a6", sku:"CS0158", name:"Cansheng Color TPU - Repair Metallic Sand Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0158.jpg", price:34300, urlSlug:"cansheng-color-tpu-repair-metallic-sand-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"714177b8-8c93-4623-bd97-6afe667035fb", sku:"CS0159", name:"Cansheng Color TPU - Metallic Ice Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0159.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-ice-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"0f60e33f-7131-4753-bbb8-403793d111d0", sku:"CS0160", name:"Cansheng Color TPU - Morandi Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0160.jpg", price:34300, urlSlug:"cansheng-color-tpu-morandi-purple", group:"purple", colorHex:"#3F959C", swatchRank:94, includeInAll:true, includeInPopular:false },
  { id:"28b2b2fd-f646-4187-b77c-57ee9fb33c2b", sku:"CS0161", name:"Cansheng Color TPU - Lugano Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0161.jpg", price:34300, urlSlug:"cansheng-color-tpu-lugano-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"48e5ba5f-de43-4cb2-b049-6805ed953539", sku:"CS0162", name:"Cansheng Color TPU - Gentian Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0162.jpg", price:34300, urlSlug:"cansheng-color-tpu-gentian-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"8c74a41b-cc13-4f9c-b843-55f562f76fac", sku:"CS0163", name:"Cansheng Color TPU - Metallic Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0163.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"3655031b-526b-4b0a-8a3e-bf16ddae1fef", sku:"CS0164", name:"Cansheng Color TPU - Elegant Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0164.jpg", price:34300, urlSlug:"cansheng-color-tpu-elegant-gray", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"09a62a72-0d6d-46f2-86af-5cbafac6576b", sku:"CS0165", name:"Cansheng Color TPU - Metallic Tungsten", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0165.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-tungsten", group:"other", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"16f2d4fe-20a3-4f9c-9f3d-a71f98eda0c1", sku:"CS0166", name:"Cansheng Color TPU - Signal Yellow", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0166.jpg", price:34300, urlSlug:"cansheng-color-tpu-signal-yellow", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"005b800a-aa07-45b2-b903-045b776e8a85", sku:"CS0167", name:"Cansheng Color TPU - Crystal Orange Red", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0167.jpg", price:34300, urlSlug:"cansheng-color-tpu-crystal-orange-red", group:"red", colorHex:"#EA6134", swatchRank:12, includeInAll:false, includeInPopular:true },
  { id:"d9371758-e475-4076-aa64-a95e2db0ac67", sku:"CS0168", name:"Cansheng Color TPU - Lava Orange", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0168.jpg", price:34300, urlSlug:"cansheng-color-tpu-lava-orange", group:"orange", colorHex:"#BF5641", swatchRank:9, includeInAll:true, includeInPopular:true },
  { id:"923741be-1413-4d3b-873c-33377e9234ee", sku:"CS0169", name:"Cansheng Color TPU - Shell Pink", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0169.jpg", price:34300, urlSlug:"cansheng-color-tpu-shell-pink", group:"pink", colorHex:"#DBB5A6", swatchRank:18, includeInAll:true, includeInPopular:true },
  { id:"6e53eba9-b6bd-40b0-af98-b1ee819e0259", sku:"CS0170", name:"Cansheng Color TPU - Provence Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0170.jpg", price:34300, urlSlug:"cansheng-color-tpu-provence-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"f1be6cd3-d823-45cf-850e-4815f1986ccd", sku:"CS0171", name:"Cansheng Color TPU - Starlight Ruby Red", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0171.jpg", price:34300, urlSlug:"cansheng-color-tpu-starlight-ruby-red", group:"red", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"e0ffa311-c408-48ee-883b-1acb37df2809", sku:"CS0172", name:"Cansheng Color TPU - Strawberry Red", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0172.jpg", price:34300, urlSlug:"cansheng-color-tpu-strawberry-red", group:"red", colorHex:"#C1474A", swatchRank:16, includeInAll:false, includeInPopular:true },
  { id:"4ebab595-fc80-43ee-a8cb-40904475ad8a", sku:"CS0173", name:"Cansheng Color TPU - Armor Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0173.jpg", price:34300, urlSlug:"cansheng-color-tpu-armor-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"51e26726-56df-4f45-bdf5-a8d2d0327dbc", sku:"CS0174", name:"Cansheng Color TPU - Onium Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0174.jpg", price:34300, urlSlug:"cansheng-color-tpu-onium-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"5cadf914-82bc-485d-a7e4-d3caa20561cc", sku:"CS0175", name:"Cansheng Color TPU - Acid Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0175.jpg", price:34300, urlSlug:"cansheng-color-tpu-acid-green", group:"green", colorHex:"#B7CE37", swatchRank:45, includeInAll:true, includeInPopular:false },
  { id:"6d46b7d9-158e-42fa-be79-b731a8c5d5fc", sku:"CS0176", name:"Cansheng Color TPU - Hazy Grey Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0176.jpg", price:34300, urlSlug:"cansheng-color-tpu-hazy-grey-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"e384fcbb-98d5-4974-8247-bbbc6f168675", sku:"CS0177", name:"Cansheng Color TPU - Mint Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0177.jpg", price:34300, urlSlug:"cansheng-color-tpu-mint-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"af4cb56e-ba97-48c4-aab3-8138ddd5ae18", sku:"CS0178", name:"Cansheng Color TPU - Black Olive Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0178.jpg", price:34300, urlSlug:"cansheng-color-tpu-black-olive-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"e262c746-c896-43db-a63d-e96d8554a1f0", sku:"CS0179", name:"Cansheng Color TPU - Meissen Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0179.jpg", price:34300, urlSlug:"cansheng-color-tpu-meissen-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"bf8fc557-0fc4-4187-96f4-f2e79348fe61", sku:"CS0180", name:"Cansheng Color TPU - Miami Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0180.jpg", price:34300, urlSlug:"cansheng-color-tpu-miami-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"ccab8fe0-ec44-4b3f-b140-6bf6a2993725", sku:"CS0181", name:"Cansheng Color TPU - Neptune Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0181.jpg", price:34300, urlSlug:"cansheng-color-tpu-neptune-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"7ebc8b33-d6b2-4077-a051-603288680cc8", sku:"CS0182", name:"Cansheng Color TPU - Agate Ash", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0182.jpg", price:34300, urlSlug:"cansheng-color-tpu-agate-ash", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"866d2e8a-865c-4752-a176-cf9551cdb7b8", sku:"CS0183", name:"Cansheng Color TPU - Glossy Cement Grey", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0183.jpg", price:34300, urlSlug:"cansheng-color-tpu-glossy-cement-grey-cs0183", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"b4ca09e3-19cd-46c8-8261-2f1daae1fcca", sku:"CS0184", name:"Cansheng Color TPU - Mystery Grey", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0184.jpg", price:34300, urlSlug:"cansheng-color-tpu-mystery-grey", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"e35ae669-7e2b-40e5-aa67-b1c5eca2db8d", sku:"CS0185", name:"Cansheng Color TPU - Light Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0185.jpg", price:34300, urlSlug:"cansheng-color-tpu-light-gray", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"532fe8e6-dfa4-47c5-a0eb-1ba9554ed82e", sku:"CS0186", name:"Cansheng Color TPU - Polar Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0186.jpg", price:34300, urlSlug:"cansheng-color-tpu-polar-gray", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"9b3c2e26-e255-4a86-93df-a1c5bbd97462", sku:"CS0187", name:"Cansheng Color TPU - Brocade Red", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0187.jpg", price:34300, urlSlug:"cansheng-color-tpu-brocade-red", group:"red", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"163a47d3-c2d7-4d4b-b05b-f7f0145cd554", sku:"CS0188", name:"Cansheng Color TPU - Bright Black Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0188.jpg", price:34300, urlSlug:"cansheng-color-tpu-bright-black-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"0e909ce9-a015-4234-9c10-e50cf45a8477", sku:"CS0189", name:"Cansheng Color TPU - Eucalyptus", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0189.jpg", price:34300, urlSlug:"cansheng-color-tpu-eucalyptus", group:"other", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"9d2fb110-f425-4730-95cb-41cf816bcf12", sku:"CS0190", name:"Cansheng Color TPU - Mamba Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0190.jpg", price:34300, urlSlug:"cansheng-color-tpu-mamba-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"be021df2-c1f2-47f8-8be1-e59d4dc89682", sku:"CS0191", name:"Cansheng Color TPU - Metallic British Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0191.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-british-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"3862b552-2867-4fe1-99fd-c8f672c14dd3", sku:"CS0192", name:"Cansheng Color TPU - British Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0192.jpg", price:34300, urlSlug:"cansheng-color-tpu-british-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"e34195a6-37b1-404f-a005-6643afbd98eb", sku:"CS0193", name:"Cansheng Color TPU - Diamond Aurora Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0193.jpg", price:34300, urlSlug:"cansheng-color-tpu-diamond-aurora-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"786d7d80-fd25-47bd-9cbc-f71043f35b94", sku:"CS0194", name:"Cansheng Color TPU - Charcoal Gray Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0194.jpg", price:34300, urlSlug:"cansheng-color-tpu-charcoal-gray-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"35088a4e-347b-4405-849f-cfe43119b254", sku:"CS0195", name:"Cansheng Color TPU - Blue Velvet", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0195.jpg", price:34300, urlSlug:"cansheng-color-tpu-blue-velvet", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"ec788eb0-4785-41de-8ed0-970b06219c35", sku:"CS0196", name:"Cansheng Color TPU - Brooklyn Grey", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0196.jpg", price:34300, urlSlug:"cansheng-color-tpu-brooklyn-grey", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"75a8fc0f-7642-45ee-91fd-aef9e4be9060", sku:"CS0197", name:"Cansheng Color TPU - Bernina Grey", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0197.jpg", price:34300, urlSlug:"cansheng-color-tpu-bernina-grey", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"f45cf826-a049-4c97-a791-682e594ca37c", sku:"CS0198", name:"Cansheng Color TPU - Blue Black", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0198.jpg", price:34300, urlSlug:"cansheng-color-tpu-blue-black", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"f3926ba2-b5ed-4a01-b6c3-dfd8259c84a6", sku:"CS0199", name:"Cansheng Color TPU - Noble and Elegant White", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0199.jpg", price:34300, urlSlug:"cansheng-color-tpu-noble-and-elegant-white", group:"white", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"294e3fe5-7af6-4f6e-87c6-c9ae8f632ec2", sku:"CS0200", name:"Cansheng Color TPU - Pepper White", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0200.jpg", price:34300, urlSlug:"cansheng-color-tpu-pepper-white", group:"white", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"300fe748-e32c-4702-869c-f538b1117c37", sku:"CS0201", name:"Cansheng Color TPU - Brilliant Rock Lime", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0201.jpg", price:34300, urlSlug:"cansheng-color-tpu-brilliant-rock-lime", group:"other", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"d1e97520-a6c4-43df-8354-e411527668a5", sku:"CS0202", name:"Cansheng Color TPU - Gotland Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0202.jpg", price:34300, urlSlug:"cansheng-color-tpu-gotland-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"ad1d8d9e-8c5e-4c83-a731-9d67cfe7ab6b", sku:"CS0203", name:"Cansheng Color TPU - Sonoma Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0203.jpg", price:34300, urlSlug:"cansheng-color-tpu-sonoma-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"762bb286-1e8c-4e82-a8ee-2cb4ee6f31e7", sku:"CS0204", name:"Cansheng Color TPU - Metallic Sepang Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0204.jpg", price:34300, urlSlug:"cansheng-color-tpu-metallic-sepang-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"e88ddc8a-4c46-4139-8c6c-f0fe3a7eebc9", sku:"CS0205", name:"Cansheng Color TPU - Navarra Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0205.jpg", price:34300, urlSlug:"cansheng-color-tpu-navarra-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"97a58ffb-5467-42be-94cf-2aafd92e8cc2", sku:"CS0206", name:"Cansheng Color TPU - Repair Nadeau Grey", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0206.jpg", price:34300, urlSlug:"cansheng-color-tpu-repair-nadeau-grey", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"a738b33a-4d62-4cdf-b350-012e61d649c9", sku:"CS0207", name:"Cansheng Color TPU - Tourmaline Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0207.jpg", price:34300, urlSlug:"cansheng-color-tpu-tourmaline-gray", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"ab3f574c-86d2-47a5-a2f7-18ca3533b1b7", sku:"CS0208", name:"Cansheng Color TPU - Fighting Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0208.jpg", price:34300, urlSlug:"cansheng-color-tpu-fighting-green", group:"green", colorHex:"#7E7855", swatchRank:34, includeInAll:true, includeInPopular:false },
  { id:"f974efbf-04ae-41e1-8359-39a4b87125ce", sku:"CS0209", name:"Cansheng Color TPU - Viper Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0209.jpg", price:34300, urlSlug:"cansheng-color-tpu-viper-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"0b2705ce-ceed-4b98-adbe-89dc360416c6", sku:"CS0210", name:"Cansheng Color TPU - Lizard Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0210.jpg", price:34300, urlSlug:"cansheng-color-tpu-lizard-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"a5a73172-9dc7-43bf-9caa-26cd1e215d00", sku:"CS0211", name:"Cansheng Color TPU - Hell Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0211.jpg", price:34300, urlSlug:"cansheng-color-tpu-hell-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"5223f9ff-391e-42e0-94ed-1d19caccf81e", sku:"CS0212", name:"Cansheng Color TPU - Battleship Grey", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0212.jpg", price:34300, urlSlug:"cansheng-color-tpu-battleship-grey", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"6359bfb3-6c0d-4cb1-8f19-8f969abbd767", sku:"CS0213", name:"Cansheng Color TPU - Glossy Dark Grey", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0213.jpg", price:34300, urlSlug:"cansheng-color-tpu-glossy-dark-grey", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"9385d03b-2003-47a1-88a2-c271e5266e0b", sku:"CS0214", name:"Cansheng Color TPU - Streamer Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0214.jpg", price:34300, urlSlug:"cansheng-color-tpu-streamer-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"98c61b34-c5e1-4d83-ad29-77be8a199a5a", sku:"CS0215", name:"Cansheng Color TPU - Far Peak Ash", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0215.jpg", price:34300, urlSlug:"cansheng-color-tpu-far-peak-ash", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"a78d131c-6309-4625-9265-e3894b3bbedb", sku:"CS0216", name:"Cansheng Color TPU - Nano Grey", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0216.jpg", price:34300, urlSlug:"cansheng-color-tpu-nano-grey", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"dd87eb60-a9e7-4a3e-bffc-219b49efe400", sku:"CS0217", name:"Cansheng Color TPU - Coral Orange", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0217.jpg", price:34300, urlSlug:"cansheng-color-tpu-coral-orange", group:"orange", colorHex:"#DAAE9C", swatchRank:19, includeInAll:true, includeInPopular:true },
  { id:"82ecd93d-3bbb-4758-a962-2992c88854ce", sku:"CS0218", name:"Cansheng Color TPU - Martin Racing Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0218.jpg", price:34300, urlSlug:"cansheng-color-tpu-martin-racing-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"b68db858-f816-4e6b-9cc2-7d6e6a5ba951", sku:"CS0219", name:"Cansheng Color TPU - Hadrin Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0219.jpg", price:34300, urlSlug:"cansheng-color-tpu-hadrin-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"209217b4-3045-4acb-a649-c8472e9bac81", sku:"CS0220", name:"Cansheng Color TPU - Rainbow Emerald", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0220.jpg", price:34300, urlSlug:"cansheng-color-tpu-rainbow-emerald", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"a82600a0-b566-4667-bcfd-37a29a5ea508", sku:"CS0221", name:"Cansheng Color TPU - Mako Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0221.jpg", price:34300, urlSlug:"cansheng-color-tpu-mako-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"8bd0d5d2-81f0-4b36-8436-81ec30814b54", sku:"CS0222", name:"Cansheng Color TPU - Royal Spindle Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0222.jpg", price:34300, urlSlug:"cansheng-color-tpu-royal-spindle-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"fe10eccf-6b8f-4fdc-bbbf-a5218e328886", sku:"CS0223", name:"Cansheng Color TPU - Diamond Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0223.jpg", price:34300, urlSlug:"cansheng-color-tpu-diamond-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"93e20704-3fc7-49a4-b460-433064465229", sku:"CS0224", name:"Cansheng Color TPU - Silver Fox Grey", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0224.jpg", price:34300, urlSlug:"cansheng-color-tpu-silver-fox-grey", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"343eaea0-ea67-432c-950b-f8e5c892395a", sku:"CS0225", name:"Cansheng Color TPU - Racing Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0225.jpg", price:34300, urlSlug:"cansheng-color-tpu-racing-green-cs0225", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"458b13e2-8a45-472f-b2b7-790c43b20413", sku:"CS0226", name:"Cansheng Color TPU - Cold Crystal Light Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0226.jpg", price:34300, urlSlug:"cansheng-color-tpu-cold-crystal-light-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"26225e1d-ab66-41b0-b38b-9def69910640", sku:"CS0227", name:"Cansheng Color TPU - Liquid Metallic Mousse White", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0227.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-mousse-white", group:"white", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"804fd482-f63c-487d-a4f5-eed0d42b9e8d", sku:"CS0228", name:"Cansheng Color TPU - Liquid Metallic Coffee", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0228.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-coffee", group:"brown", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"a5fbb494-902e-4223-937c-4cd870bbb5cb", sku:"CS0229", name:"Cansheng Color TPU - Liquid Metal Shell Powder", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0229.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metal-shell-powder", group:"red", colorHex:"#E2C7C2", swatchRank:8, includeInAll:false, includeInPopular:true },
  { id:"0deab182-6480-44c5-a976-573540ad304a", sku:"CS0230", name:"Cansheng Color TPU - Liquid Metallic Jedi Pink", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0230.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-jedi-pink", group:"pink", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"f086f7a6-6392-4ced-a4d2-6dc76d0a4d71", sku:"CS0231", name:"Cansheng Color TPU - Liquid Metallic Loganberry", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0231.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-loganberry", group:"other", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"5ab225d7-bb1c-4a62-8748-52fdefce702d", sku:"CS0232", name:"Cansheng Color TPU - Liquid Metallic Cherry Red", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0232.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-cherry-red", group:"red", colorHex:"#994542", swatchRank:6, includeInAll:false, includeInPopular:true },
  { id:"a006e555-5d4e-4113-8ba2-b773fae28f8a", sku:"CS0233", name:"Cansheng Color TPU - Liquid Metallic Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0233.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"e12bb85c-37c1-4d74-a413-f822b65991c0", sku:"CS0234", name:"Cansheng Color TPU - Liquid Metallic Cangling Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0234.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-cangling-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"6b76d11a-e824-4160-a7c8-1a87d01c7762", sku:"CS0235", name:"Cansheng Color TPU - Liquid Metallic Grace Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0235.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-grace-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"9ac8429c-e011-4b87-9006-028f63c92a9c", sku:"CS0236", name:"Cansheng Color TPU - Liquid Metallic Stratosphere Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0236.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-stratosphere-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"1b30f2a6-ac45-4d6f-8551-ce43e99fb257", sku:"CS0237", name:"Cansheng Color TPU - Liquid Metal Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0237.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metal-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"bd6c2a8f-d5dc-49b4-b8dd-664150e93b17", sku:"CS0238", name:"Cansheng Color TPU - Liquid Metallic Tungsten Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0238.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-tungsten-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"37534265-5ab3-4007-add4-3aeb4823574a", sku:"CS0239", name:"Cansheng Color TPU - Liquid Metallic Grayish Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0239.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-grayish-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"fd8b818a-dba5-4ec9-8a49-ae1c8841c222", sku:"CS0240", name:"Cansheng Color TPU - Liquid Metallic Somato Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0240.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-somato-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"64c9a2c0-b8a2-421b-9a4c-856fda16ced1", sku:"CS0241", name:"Cansheng Color TPU - Liquid Metallic High-Grade Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0241.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-high-grade-gray", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"d19ba954-65eb-4347-98d0-b51c4eed68a5", sku:"CS0242", name:"Cansheng Color TPU - Liquid Metallic Ebony Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0242.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-ebony-gray", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"bbaa9ec2-1f9d-4351-a54f-57ceb8d7448d", sku:"CS0243", name:"Cansheng Color TPU - Liquid Aluminum Mercury", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0243.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-aluminum-mercury", group:"other", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"21de9a1e-35c1-41df-bc0b-4fd6d6fd9296", sku:"CS0244", name:"Cansheng Color TPU - Liquid Metallic Titanium Silver", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0244.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-titanium-silver", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"b965ee36-9444-4bed-ab57-28b040cb1eb7", sku:"CS0245", name:"Cansheng Color TPU - Liquid Metallic Tungsten Steel", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0245.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-tungsten-steel", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"5432927b-2353-423a-9b49-07416b031aca", sku:"CS0246", name:"Cansheng Color TPU - Liquid Metallic Bronze", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0246.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-bronze", group:"other", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"87c6e739-7573-4c5f-83f3-fcf4e2462a7c", sku:"CS0247", name:"Cansheng Color TPU - Liquid Metallic Coffee Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0247.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-coffee-gray", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"7871e1c1-ef26-4764-a557-cc2d2e5f5ef5", sku:"CS0248", name:"Cansheng Color TPU - Liquid Metallic Titanium Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0248.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-titanium-gray", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"5385d7a1-bdb7-452f-964e-1dc193d84107", sku:"CS0249", name:"Cansheng Color TPU - Liquid Metallic Gun Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0249.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-gun-gray", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"90aa3ee5-2739-447a-a88e-b01df07ab67d", sku:"CS0250", name:"Cansheng Color TPU - Liquid Metallic Black", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0250.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-metallic-black", group:"black", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"c9d6e333-0a51-42a0-a06a-3d6eba9a1040", sku:"CS0251", name:"Cansheng Color TPU - Liquid Dark Silver", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0251.jpg", price:34300, urlSlug:"cansheng-color-tpu-liquid-dark-silver", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"f934a71c-64ac-4e4c-a7ca-9751feb30fcb", sku:"CS0252", name:"Cansheng Color TPU - Matte Desert Yellow", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0252.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-desert-yellow", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"48966941-4787-4738-a1b4-9f4fc950c88f", sku:"CS0253", name:"Cansheng Color TPU - Matte AMG Desert Yellow", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0253.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-amg-desert-yellow", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"e68c9c64-f543-432a-b4b3-63cd8cd5407d", sku:"CS0254", name:"Cansheng Color TPU - Matte Magic Flame Brazilian Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0254.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-magic-flame-brazilian-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"d249053c-d100-47d7-84ec-f69fac9db684", sku:"CS0255", name:"Cansheng Color TPU - Capri Gray Purple(Matte)", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0255.jpg", price:34300, urlSlug:"cansheng-color-tpu-capri-gray-purple-matte", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"a69d2396-5344-4bf0-9832-985579fa4580", sku:"CS0256", name:"Cansheng Color TPU - Ultra-Matte Electroplate Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0256.jpg", price:34300, urlSlug:"cansheng-color-tpu-ultra-matte-electroplate-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"b406bf77-399d-4c59-bc64-f96e83cce299", sku:"CS0257", name:"Cansheng Color TPU - Matte Alexander Silver", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0257.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-alexander-silver", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"c5c9a10d-4f4e-4239-998b-e8b4c95ff805", sku:"CS0258", name:"Cansheng Color TPU - Matte Titanium Silver", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0258.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-titanium-silver", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"b65459e4-fb12-4cd3-9026-2f7211e08a31", sku:"CS0259", name:"Cansheng Color TPU - Matte Liquid Metallic Somato Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0259.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-liquid-metallic-somato-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"cd713973-c76d-4554-ac59-e970e179ac84", sku:"CS0260", name:"Cansheng Color TPU - Satin Liquid Metallic Star Silver", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0260.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-liquid-metallic-star-silver", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"52e782c7-9c6e-434d-b1e1-1d8a49959180", sku:"CS0261", name:"Cansheng Color TPU - Matte Blue Charm Gold", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0261.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-blue-charm-gold", group:"blue", colorHex:"#C9DCD9", swatchRank:69, includeInAll:true, includeInPopular:false },
  { id:"07ded7e3-8efc-497c-932b-bf83612dac6b", sku:"CS0262", name:"Cansheng Color TPU - Matte Sports Yellow", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0262.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-sports-yellow", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"6bd36971-fc02-44f1-a6c7-ab0f073c6e73", sku:"CS0263", name:"Cansheng Color TPU - Matte Shining Orange", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0263.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-shining-orange", group:"orange", colorHex:"#F79A3A", swatchRank:23, includeInAll:false, includeInPopular:true },
  { id:"4bc357ae-e374-46cd-833d-6fc717c0498c", sku:"CS0264", name:"Cansheng Color TPU - Matte Fantasy Grayish Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0264.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-fantasy-grayish-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"d817b162-6d66-4417-bb24-69f7af5fb9c9", sku:"CS0265", name:"Cansheng Color TPU - Matte Mysterious Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0265.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-mysterious-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"754d8c75-4de5-44e5-85c0-ac95f161282e", sku:"CS0266", name:"Cansheng Color TPU - Matte Shark Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0266.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-shark-gray", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"99d9a5b4-915f-4da2-88c4-228e37b11dd3", sku:"CS0267", name:"Cansheng Color TPU - Matte Metal Space Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0267.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-metal-space-gray", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"7dd5164b-8d7b-441d-a7d2-d0e276ef5528", sku:"CS0268", name:"Cansheng Color TPU - Matte Purple Mist Silver", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0268.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-purple-mist-silver", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"fe9f9027-7e33-4f7c-b7c2-a67bb9cb369f", sku:"CS0269", name:"Cansheng Color TPU - Satin Liquid Metallic Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0269.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-liquid-metallic-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"8b468e4e-72c5-48a7-be38-4ce792dd204b", sku:"CS0270", name:"Cansheng Color TPU - Matte Black Phantom Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0270.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-black-phantom-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"5000012b-ce4d-475e-9ecf-546a931684de", sku:"CS0271", name:"Cansheng Color TPU - Matte Midnight Black", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0271.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-midnight-black", group:"black", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"d9f1ff76-c8f6-4000-aad8-a27d2f11dcf2", sku:"CS0272", name:"Cansheng Color TPU - Matte Deep Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0272.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-deep-gray", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"eef85e35-55cf-482f-bcaa-cd6cf9a4740a", sku:"CS0273", name:"Cansheng Color TPU - Satin Ceramic White T", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0273.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-ceramic-white-t", group:"white", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"9ae9fe30-bedc-4b91-92fb-64df22377645", sku:"CS0274", name:"Cansheng Color TPU - Matte Mineral White", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0274.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-mineral-white", group:"blue", colorHex:"#D3DEDD", swatchRank:74, includeInAll:true, includeInPopular:false },
  { id:"27878e82-23c0-4f6d-9f7a-dfc920233fe1", sku:"CS0275", name:"Cansheng Color TPU - Dawn White", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0275.jpg", price:34300, urlSlug:"cansheng-color-tpu-dawn-white", group:"white", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"7ace5070-8758-4650-9108-98fc182de8d8", sku:"CS0276", name:"Cansheng Color TPU - Satin Aluminum Mercury", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0276.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-aluminum-mercury", group:"other", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"2bb91ef3-2d31-4093-aaf6-96fbc94bf878", sku:"CS0277", name:"Cansheng Color TPU - Matte Electroplated Tungsten Steel", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0277.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-electroplated-tungsten-steel", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"07b1e216-1f2b-4cd8-8b82-4e520e6794b2", sku:"CS0278", name:"Cansheng Color TPU - Matte Dark Silver", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0278.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-dark-silver", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"6c4a1346-b1c7-4714-9457-a49d20fdea33", sku:"CS0279", name:"Cansheng Color TPU - Satin Liquid Metallic Silver", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0279.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-liquid-metallic-silver", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"51da5c6a-e20f-4536-988c-3625c2639fcd", sku:"CS0280", name:"Cansheng Color TPU - Matte Grayish Brown", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0280.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-grayish-brown", group:"yellow", colorHex:"#D2C38B", swatchRank:30, includeInAll:true, includeInPopular:false },
  { id:"30632737-7f78-4191-8f84-d41c56e939a0", sku:"CS0281", name:"Cansheng Color TPU - Satin Gold Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0281.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-gold-green", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"3e49bbf4-d1f6-4faf-9a70-f04e901aeea5", sku:"CS0282", name:"Cansheng Color TPU - Matte Liquid Combat Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0282.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-liquid-combat-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"0f17a207-a4e1-4287-9ea7-0e244cc9d413", sku:"CS0283", name:"Cansheng Color TPU - Satin Twilight Gold", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0283.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-twilight-gold", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"77ab0e1f-16b9-4324-b873-bb16c2c342d2", sku:"CS0284", name:"Cansheng Color TPU - Satin Liquid Metallic Bronze", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0284.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-liquid-metallic-bronze", group:"other", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"b0ac385a-0f64-4c40-a952-be2bbd7d0517", sku:"CS0285", name:"Cansheng Color TPU - Satin Khaki Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0285.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-khaki-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"bca193d1-b93e-496e-a48e-c46b5f298171", sku:"CS0286", name:"Cansheng Color TPU - Satin Army Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0286.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-army-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"61deb062-3a93-440a-8c68-db1b841d941b", sku:"CS0287", name:"Cansheng Color TPU - Ghost Metal Dark Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0287.jpg", price:34300, urlSlug:"cansheng-color-tpu-ghost-metal-dark-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"3bc2c6bc-35c4-4d08-b6ed-6b4c23749938", sku:"CS0288", name:"Cansheng Color TPU - Satin Venom Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0288.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-venom-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"d154a6f1-cb4c-48bf-9807-a88b438f5bd2", sku:"CS0289", name:"Cansheng Color TPU - Ghost Chrome Romanee Red", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0289.jpg", price:34300, urlSlug:"cansheng-color-tpu-ghost-chrome-romanee-red", group:"red", colorHex:"#866261", swatchRank:5, includeInAll:false, includeInPopular:true },
  { id:"d82a2512-8ab3-4a14-bf19-609f34d43108", sku:"CS0290", name:"Cansheng Color TPU - Matte Liquid Metallic Dracaena Red", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0290.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-liquid-metallic-dracaena-red", group:"red", colorHex:"#5B4649", swatchRank:13, includeInAll:false, includeInPopular:true },
  { id:"6a17572d-243b-41ac-862c-14a833a3336b", sku:"CS0291", name:"Cansheng Color TPU - Satin Black Pinot Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0291.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-black-pinot-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"ec7cefb6-74e4-4c64-8743-7639d3e4a45a", sku:"CS0292", name:"Cansheng Color TPU - Matte Ghost Midnight Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0292.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-ghost-midnight-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"9bd3c521-7481-40d0-9014-475e3852fb10", sku:"CS0293", name:"Cansheng Color TPU - Black Fantasy Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0293.jpg", price:34300, urlSlug:"cansheng-color-tpu-black-fantasy-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"bbed5995-4f96-4acc-9cd5-81f03828c26f", sku:"CS0294", name:"Cansheng Color TPU - Lead Ink Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0294.jpg", price:34300, urlSlug:"cansheng-color-tpu-lead-ink-gray", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"ba62d3e5-1b3b-4a27-a4aa-0355e03f3811", sku:"CS0295", name:"Cansheng Color TPU - Satin Grey Leteorite", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0295.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-grey-leteorite", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"54578883-4f73-49cf-8f0e-1c926ae73dd3", sku:"CS0296", name:"Cansheng Color TPU - Satin Grayish Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0296.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-grayish-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"9dfbea2b-af95-4a1c-8429-73776ddea7e2", sku:"CS0297", name:"Cansheng Color TPU - Matte Metallic Titanium", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0297.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-metallic-titanium", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"0d4fb8ea-f7b8-4a18-89ee-43eea4cff571", sku:"CS0298", name:"Cansheng Color TPU - Matte Magic Flame Dark Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0298.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-magic-flame-dark-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"a705fc8b-91bb-41ce-8d7e-f8c6e6ff9f27", sku:"CS0299", name:"Cansheng Color TPU - Satin Tunisian Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0299.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-tunisian-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"024e9451-ef5d-4519-a226-32b16823961a", sku:"CS0300", name:"Cansheng Color TPU - Satin Rose Gold T", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0300.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-rose-gold-t", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"5b718527-ac43-4e6b-aca0-4152db99447b", sku:"CS0301", name:"Cansheng Color TPU - Satin Stealth Black T", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0301.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-stealth-black-t", group:"black", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"ade4a8a1-3c0a-4364-a660-3fa097a45cde", sku:"CS0302", name:"Cansheng Color TPU - Matte Metallic STO Track Gold Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0302.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-metallic-sto-track-gold-green", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"640560a3-4623-41f9-884e-87dc0e85d53b", sku:"CS0303", name:"Cansheng Color TPU - Matte Battleship Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0303.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-battleship-gray", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"acc937d8-3a3c-4bf4-8d42-def2b90d5437", sku:"CS0304", name:"Cansheng Color TPU - Matte Combat Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0304.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-combat-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"42d04050-b500-4623-92f4-1772f0c904f6", sku:"CS0305", name:"Cansheng Color TPU - Matte Magic Flame Shadow Brown", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0305.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-magic-flame-shadow-brown", group:"brown", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"6b7002b0-76eb-4265-ad3d-c1805bec1a86", sku:"CS0306", name:"Cansheng Color TPU - Matte Liquid Shadow Gold", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0306.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-liquid-shadow-gold", group:"yellow", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"cca982cc-7048-4c8a-89aa-b862dc7af828", sku:"CS0307", name:"Cansheng Color TPU - Satin Competition Blue", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0307.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-competition-blue", group:"blue", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"e8b0d00d-380d-4bd2-8f1f-8391965f35f1", sku:"CS0308", name:"Cansheng Color TPU - Satin Shang Geyan", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0308.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-shang-geyan", group:"other", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"702c6ee0-0ed6-44cf-a612-63e767d19953", sku:"CS0309", name:"Cansheng Color TPU - Satin Olive Green", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0309.jpg", price:34300, urlSlug:"cansheng-color-tpu-satin-olive-green", group:"green", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"1917dd63-deae-4d31-8de4-2d3a065a3973", sku:"CS0310", name:"Cansheng Color TPU - Fantasy Spectrum Purple", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0310.jpg", price:34300, urlSlug:"cansheng-color-tpu-fantasy-spectrum-purple", group:"purple", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"44ccedaf-3bce-42e8-a2a1-3dbcbeb00059", sku:"CS0311", name:"Cansheng Color TPU - Glossy Grass Green Red", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0311.jpg", price:34300, urlSlug:"cansheng-color-tpu-glossy-grass-green-red", group:"red", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"cab145aa-ef2f-487e-ad07-2a93a59085ed", sku:"CS0312", name:"Cansheng Color TPU - Star Sky Black Phantom Red", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0312.jpg", price:34300, urlSlug:"cansheng-color-tpu-star-sky-black-phantom-red", group:"red", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"91dab1f2-2dcf-4a64-ad11-12b26b3020d7", sku:"CS0313", name:"Cansheng Color TPU - Streaming Black Charm Red", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0313.jpg", price:34300, urlSlug:"cansheng-color-tpu-streaming-black-charm-red", group:"red", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"ff68d733-86c2-441f-9358-01f4e6b4f518", sku:"CS0314", name:"Cansheng Color TPU - Demon Flame Splendid Grey", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0314.jpg", price:34300, urlSlug:"cansheng-color-tpu-demon-flame-splendid-grey", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"707d419f-b867-481a-a712-0d800a3ff563", sku:"CS0315", name:"Cansheng Color TPU - Matte 3D Colorful Gray", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0315.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-3d-colorful-gray", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"1c0d82a5-8351-4939-88bd-0d2989c0a29d", sku:"CS0316", name:"Cansheng Color TPU - Medium Gold Starry Sky Pink", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0316.jpg", price:34300, urlSlug:"cansheng-color-tpu-medium-gold-starry-sky-pink", group:"pink", colorHex:"#BDC5D1", swatchRank:120, includeInAll:true, includeInPopular:false },
  { id:"0978bb2e-5c5d-4613-bac9-0ffa0277b1d7", sku:"CS0317", name:"Cansheng Color TPU - Flower Carbon Silver", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0317.jpg", price:34300, urlSlug:"cansheng-color-tpu-flower-carbon-silver", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"03817131-0c6e-4321-be7b-9dd8e30ed317", sku:"CS0318", name:"Cansheng Color TPU - Flower Carbon Red", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0318.jpg", price:34300, urlSlug:"cansheng-color-tpu-flower-carbon-red", group:"red", colorHex:"#4F3B3D", swatchRank:14, includeInAll:false, includeInPopular:true },
  { id:"df14666a-23f2-4155-af86-3bba3cde86fa", sku:"CS0319", name:"Cansheng Color TPU - Carbon Fiber Bright", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0319.jpg", price:34300, urlSlug:"cansheng-color-tpu-carbon-fiber-bright", group:"black", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"687d744f-8a47-40b0-bb58-8f7a42fd96f6", sku:"CS0320", name:"Cansheng Color TPU - Transparent Carbon Fiber", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0320.jpg", price:34300, urlSlug:"cansheng-color-tpu-transparent-carbon-fiber", group:"black", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"89d6f3c2-ba4f-42e6-9538-c5c1b331fe84", sku:"CS0321", name:"Cansheng Color TPU - Matte Transparent Carbon Fiber", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0321.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-transparent-carbon-fiber", group:"black", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"7c8809eb-b617-4d3f-8e53-7a448eb3089c", sku:"CS0322", name:"Cansheng Color TPU - Carbon Fiber Liquid Metallic Aluminum", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0322.jpg", price:34300, urlSlug:"cansheng-color-tpu-carbon-fiber-liquid-metallic-aluminum", group:"black", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"afa95066-17f4-4984-823c-4932ea69b607", sku:"CS0323", name:"Cansheng Color TPU - Matte Optical Carbon Fiber Silver", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0323.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-optical-carbon-fiber-silver", group:"gray", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false },
  { id:"93c62e88-ec87-4bda-be55-26620efe6b66", sku:"CS0324", name:"Cansheng Color TPU - Matte Transparent Carbon Fiber", primaryImage:"https://assets.nanoshieldfilm.com/uploads/cansheng-cropped/CS0324.jpg", price:34300, urlSlug:"cansheng-color-tpu-matte-transparent-carbon-fiber-cs0324", group:"black", colorHex:"#888888", swatchRank:999, includeInAll:true, includeInPopular:false }
];

function normalizeHex(hex?: string | null): string | null {
  if (!hex) return null;
  const trimmed = hex.trim();
  const normalized = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  return `#${normalized.toUpperCase()}`;
}
function hexToRgb(hex?: string | null) {
  const n = normalizeHex(hex); if (!n) return null;
  const r = n.slice(1);
  return { r: parseInt(r.slice(0,2),16), g: parseInt(r.slice(2,4),16), b: parseInt(r.slice(4,6),16) };
}
function rgbToHsl(r: number, g: number, b: number) {
  const rn=r/255, gn=g/255, bn=b/255, max=Math.max(rn,gn,bn), min=Math.min(rn,gn,bn), delta=max-min;
  let h=0;
  if(delta!==0){if(max===rn)h=((gn-bn)/delta)%6;else if(max===gn)h=(bn-rn)/delta+2;else h=(rn-gn)/delta+4;h*=60;if(h<0)h+=360;}
  const l=(max+min)/2, s=delta===0?0:delta/(1-Math.abs(2*l-1));
  return {h,s,l};
}
function groupLabel(group: ExplorerGroup) { return group === "all" ? "All" : FILM_COLOR_GROUP_LABELS[group]; }
function formatShadeDisplayName(name?: string) {
  if (!name) return "No shade available";
  return name.replace(/^cansheng\s+color\s+tpu\s*-\s*/i, "").replace(/^cansheng\s+color\s+tpu\s*/i, "").trim();
}
function toSampleHref(item?: ShadeItem) {
  if (!item) return `${SITE_URL}/contact?sample=1`;
  const d = formatShadeDisplayName(item.name);
  return `${SITE_URL}/contact?sample=1&sku=${encodeURIComponent(item.sku)}&film=${encodeURIComponent(d)}&productId=${encodeURIComponent(item.id)}`;
}
function toRollHref(item?: ShadeItem) { return item?.urlSlug ? `${SITE_URL}/products/${item.urlSlug}` : `${SITE_URL}/shop`; }
function prepareShade(item: RawShade): ShadeItem {
  const colorHex = normalizeHex(item.colorHex) || FALLBACK_HEX_BY_GROUP[item.group];
  const rgb = hexToRgb(colorHex);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : { h:0, s:0, l:0 };
  return { ...item, colorHex, hue:hsl.h, saturation:hsl.s, lightness:hsl.l };
}
function sortShades(items: ShadeItem[], selectedGroup: ExplorerGroup) {
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (selectedGroup === "all") { const gd = GROUP_SORT_INDEX[a.group] - GROUP_SORT_INDEX[b.group]; if (gd !== 0) return gd; }
    const ng = NEUTRAL_GROUPS.has(a.group) && NEUTRAL_GROUPS.has(b.group);
    if (!ng) { const hd = a.hue - b.hue; if (Math.abs(hd) > 0.1) return hd; }
    const ld = b.lightness - a.lightness; if (Math.abs(ld) > 0.001) return ld;
    const sd = b.saturation - a.saturation; if (Math.abs(sd) > 0.001) return sd;
    return a.sku.localeCompare(b.sku);
  });
  return sorted;
}

const SHADES = RAW_SHADES.map(prepareShade);
const ALL_SNAPSHOT = SHADES;

const ACTIVE_GROUPS = FILM_COLOR_GROUPS.filter(g => COUNTS_BY_GROUP[g] > 0);

const PRODUCTS = [
  { id: "swatch", label: "Swatch", price: "$100", desc: '2" x 2" die-cut sample', icon: Eye, deliveryNote: "Ships in 1-2 days", image: `${import.meta.env.BASE_URL}swatch-kit.webp` },
  { id: "sample-roll", label: "Sample Roll", price: "$195", desc: '17" x 60" sample roll', icon: Shield, deliveryNote: "Ships in 3-5 days", image: null },
  { id: "full-roll", label: "Full Roll", price: "From $343", desc: '60" x 50ft full roll', icon: Zap, deliveryNote: "Lead time 5-7 days", image: null },
];


const localCss = `
  .shade-list::-webkit-scrollbar { width: 4px; }
  .shade-list::-webkit-scrollbar-track { background: transparent; }
  .shade-list::-webkit-scrollbar-thumb { background: #2a2d32; border-radius: 2px; }
  .search-wrap:focus-within .search-icon { color: #a8a8a8; }
  .search-input::placeholder { color: #404448; font-weight: 400; }
  .glass-card-tpu { background: rgba(18, 20, 24, 0.6); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.04); }
  .glass-panel-tpu { background: linear-gradient(145deg, rgba(18,20,24,0.9) 0%, rgba(14,16,18,0.95) 100%); box-shadow: 0 0 40px rgba(0,0,0,0.4); border: 1px solid rgba(255, 255, 255, 0.04); }
`;

function MaterialHero({ shade, selectedProduct }: { shade: ShadeItem | undefined; selectedProduct: string | null }) {
  const displayName = formatShadeDisplayName(shade?.name);
  const activeProduct = selectedProduct ? PRODUCTS.find(p => p.id === selectedProduct) : null;
  const showProduct = activeProduct?.image;

  return (
    <div className="flex flex-col items-center justify-between gap-6">
      <div className="space-y-3 w-full">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-tighter leading-[1.1]">
          {showProduct ? (
            <>Swatch <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent font-normal">Kit</span></>
          ) : (
            <>{displayName}</>
          )}
        </h1>
      </div>
      <div className="relative group overflow-hidden rounded-2xl bg-[#0a0a0a] border border-white/5 shadow-2xl w-full aspect-[4/3]">
        {showProduct ? (
          <img src={activeProduct!.image!} alt={activeProduct!.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]" />
        ) : shade?.primaryImage ? (
          <img src={shade.primaryImage} alt={displayName} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]" />
        ) : (
          <div className="absolute inset-0" style={{ background: shade?.colorHex || '#333' }} />
        )}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 glass-card-tpu rounded-full border border-white/10">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{shade?.sku || "---"}</span>
        </div>
      </div>
    </div>
  );
}

function PricingLoginPrompt({ className }: { className?: string }) {
  return (
    <Link href="/dealer-login?returnTo=/color-tpu" className={`inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors ${className || ""}`}>
      <Lock size={12} />
      <span>Log in for pricing</span>
    </Link>
  );
}

function PendingLabel({ className }: { className?: string }) {
  return <span className={`text-amber-400/80 italic ${className || ""}`}>Pending approval</span>;
}

function PurchaseFunnel({ selectedShade, selectedProduct, onSelectProduct }: { selectedShade: ShadeItem | undefined; selectedProduct: string | null; onSelectProduct: (id: string) => void }) {
  const [addedId, setAddedId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"swatch" | "roll" | null>(null);
  const { dealer, isApproved, isPending } = useAuth();
  const displayName = formatShadeDisplayName(selectedShade?.name);
  const rollSize = selectedProduct === "full-roll" ? "full-roll" : "sample-roll";

  const priceText = rollSize === "full-roll" ? "From $343" : "$195";
  const sizeText = rollSize === "full-roll" ? '60" x 50ft' : '17" x 60"';

  const handleAdd = (id: string) => {
    setAddedId(id);
    setTimeout(() => setAddedId(null), 2500);
  };

  return (
    <div className="space-y-3 mb-8">
      <div
        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
          activeSection === "swatch"
            ? "border-white/20 bg-white/[0.04]"
            : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
        }`}
        onClick={() => setActiveSection(prev => prev === "swatch" ? null : "swatch")}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[15px] font-semibold text-white">Swatch Kit</div>
            <div className="text-[11px] text-slate-500 mt-0.5 tracking-wide">All 324 colors included</div>
          </div>
          <span className="text-base font-medium text-slate-300 flex-shrink-0">$5</span>
        </div>
        {activeSection === "swatch" && (
          <button
            onClick={(e) => { e.stopPropagation(); handleAdd("swatch"); }}
            className={`w-full mt-4 py-4 rounded-xl text-sm font-bold uppercase tracking-[0.15em] transition-all duration-500 flex items-center justify-center gap-3 ${
              addedId === "swatch"
                ? "bg-emerald-500 text-white border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                : "bg-white text-black hover:bg-gray-200 active:scale-[0.98]"
            }`}
          >
            {addedId === "swatch" ? (
              <><Check className="w-4 h-4" /> Added to Cart</>
            ) : (
              <><ShoppingCart className="w-4 h-4" /> Add Swatch Kit to Cart</>
            )}
          </button>
        )}
      </div>

      <div
        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
          activeSection === "roll"
            ? "border-white/20 bg-white/[0.04]"
            : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
        }`}
        onClick={() => setActiveSection(prev => prev === "roll" ? null : "roll")}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[15px] font-semibold text-white">{displayName || "Select a Color"}</div>
            <div className="text-[11px] text-slate-500 mt-0.5 tracking-wide">{selectedShade?.sku || ""}</div>
          </div>
          <span className="text-base font-medium text-slate-300 flex-shrink-0">
            {isApproved ? priceText : isPending ? <PendingLabel className="text-xs" /> : <PricingLoginPrompt className="text-xs" />}
          </span>
        </div>

        {activeSection === "roll" && isApproved && (
          <div onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mt-4 mb-3">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-ns-accent">Roll Size</p>
              <span className="text-xs text-ns-subtle uppercase tracking-wider">{sizeText}</span>
            </div>
            <div className="flex gap-2 p-1 bg-black/50 rounded-xl border border-white/5">
              <button
                onClick={() => onSelectProduct("sample-roll")}
                className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                  rollSize === "sample-roll"
                    ? "bg-white text-black shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >Sample Roll</button>
              <button
                onClick={() => onSelectProduct("full-roll")}
                className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                  rollSize === "full-roll"
                    ? "bg-white text-black shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >Full Roll</button>
            </div>

            <button
              onClick={() => handleAdd("roll")}
              className={`w-full mt-4 py-4 rounded-xl text-sm font-bold uppercase tracking-[0.15em] transition-all duration-500 flex items-center justify-center gap-3 ${
                addedId === "roll"
                  ? "bg-emerald-500 text-white border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  : "bg-white text-black hover:bg-gray-200 active:scale-[0.98]"
              }`}
            >
              {addedId === "roll" ? (
                <><Check className="w-4 h-4" /> Added to Cart</>
              ) : (
                <><ShoppingCart className="w-4 h-4" /> Add {displayName} {rollSize === "full-roll" ? "Full Roll" : "Sample Roll"} to Cart</>
              )}
            </button>
          </div>
        )}

        {activeSection === "roll" && !isApproved && (
          <div className="mt-4 space-y-2" onClick={(e) => e.stopPropagation()}>
            {isPending ? (
              <div className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.15em] bg-white/10 text-amber-400/80 flex items-center justify-center gap-3">
                Account pending approval
              </div>
            ) : (
              <>
                <Link
                  href="/dealer-login?returnTo=/color-tpu"
                  className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.15em] bg-white text-black hover:bg-gray-200 active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-3"
                >
                  <Lock size={16} /> Log In for Pricing
                </Link>
                <Link
                  href="/dealer-signup"
                  className="w-full py-3 rounded-xl text-xs font-semibold uppercase tracking-[0.15em] border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Create a New Account
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


export default function ColorTPUPage() {
  const [selectedGroup, setSelectedGroup] = React.useState<ExplorerGroup>(ACTIVE_GROUPS[0] || "red");
  const [selectedSku, setSelectedSku] = React.useState<string>(DEFAULT_SKU);
  const [selectedProduct, setSelectedProduct] = useState<string | null>("swatch");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { isApproved, isPending } = useAuth();

  const allShades = ALL_SNAPSHOT;
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allShades.filter(s =>
      formatShadeDisplayName(s.name).toLowerCase().includes(q) ||
      s.sku.toLowerCase().includes(q)
    );
  }, [searchQuery, allShades]);

  const handleSearchSelect = (shade: ShadeItem) => {
    setSelectedSku(shade.sku);
    setSelectedGroup(shade.group);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const shadesInGroup = React.useMemo(() => selectedGroup === "all" ? ALL_SNAPSHOT : ALL_SNAPSHOT.filter(i => i.group === selectedGroup), [selectedGroup]);
  const filteredShades = React.useMemo(() => sortShades(shadesInGroup, selectedGroup), [selectedGroup, shadesInGroup]);

  React.useEffect(() => {
    if (filteredShades.length === 0) { setSelectedSku(""); return; }
    const exists = filteredShades.some(i => i.sku === selectedSku);
    if (!exists) {
      const def = filteredShades.find(i => i.sku === DEFAULT_SKU);
      setSelectedSku(def?.sku || filteredShades[0].sku);
    }
  }, [filteredShades, selectedSku]);

  const selectedShade = React.useMemo(() => filteredShades.find(i => i.sku === selectedSku) || filteredShades[0], [filteredShades, selectedSku]);

  return (
    <div className="min-h-screen bg-ns-dark text-ns-body font-sans selection:bg-indigo-500/30 selection:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{navCss}{localCss}</style>

      <SiteNav activePage="ppf" />

      <main className="pt-16 sm:pt-24 lg:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <MaterialHero shade={selectedShade} selectedProduct={selectedProduct} />
          </div>

          <div className="lg:col-span-5">
            <div className="glass-panel-tpu rounded-3xl p-8 lg:p-10 flex flex-col gap-8">

              <PurchaseFunnel selectedShade={selectedShade} selectedProduct={selectedProduct} onSelectProduct={(id) => setSelectedProduct(id)} />

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-ns-accent">Color Library</p>
                  <span className="text-xs text-indigo-400 uppercase tracking-wider">{formatShadeDisplayName(selectedShade?.name)}</span>
                </div>

                <div className="relative search-wrap">
                  <Search size={14} className="search-icon absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none transition-colors" />
                  <input
                    className="search-input w-full py-3 pl-10 pr-10 rounded-xl border border-white/5 bg-white/[0.03] text-white text-xs tracking-wide outline-none transition-all focus:border-white/20 focus:bg-white/[0.05]"
                    type="text"
                    placeholder="Search by color name or SKU..."
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
                    onFocus={() => setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  />
                  {searchQuery && (
                    <button
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white/10 border-none rounded-full w-5 h-5 flex items-center justify-center cursor-pointer text-slate-400 hover:bg-white/20 hover:text-white transition-all"
                      onClick={() => { setSearchQuery(""); setShowSearchResults(false); }}
                    >
                      <X size={10} />
                    </button>
                  )}
                  {showSearchResults && searchQuery.trim().length > 0 && (
                    <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-20 bg-[#1a1c22] border border-white/10 rounded-xl max-h-60 overflow-y-auto shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                      {searchResults.length > 0 ? (
                        searchResults.slice(0, 10).map(result => (
                          <div
                            key={result.sku}
                            className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors hover:bg-white/[0.06] border-b border-white/[0.03] last:border-b-0"
                            onMouseDown={() => handleSearchSelect(result)}
                          >
                            <div className="w-7 h-7 rounded-lg flex-shrink-0 border border-white/10 overflow-hidden" style={{ background: result.colorHex }}>
                              {result.primaryImage && <img src={result.primaryImage} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-white truncate">{formatShadeDisplayName(result.name)}</div>
                              <div className="text-[10px] text-slate-600 mt-0.5 tracking-wide">{result.sku}</div>
                            </div>
                            <span className="text-[8px] text-slate-700 font-semibold uppercase tracking-widest ml-auto flex-shrink-0">{FILM_COLOR_GROUP_LABELS[result.group]}</span>
                          </div>
                        ))
                      ) : (
                        <div className="py-5 px-3.5 text-center">
                          <div className="text-xs text-slate-500">No colors found</div>
                          <div className="text-[11px] text-slate-700 mt-1">Try a different name or SKU code</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap border-b border-white/5">
                  {ACTIVE_GROUPS.map(g => (
                    <button
                      key={g}
                      className={`flex items-center gap-1.5 px-3 py-2.5 bg-transparent border-none border-b-2 cursor-pointer transition-all -mb-px ${
                        selectedGroup === g
                          ? "border-b-white/60"
                          : "border-b-transparent"
                      }`}
                      onClick={() => setSelectedGroup(g)}
                    >
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white/10" style={{ background: GROUP_SWATCH_BY_GROUP[g] }} />
                      <span className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${
                        selectedGroup === g ? "text-white" : "text-slate-600 hover:text-slate-400"
                      }`}>{FILM_COLOR_GROUP_LABELS[g]}</span>
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-slate-600 tracking-wider">
                  Showing {filteredShades.length} of {ALL_SNAPSHOT.length} shades
                </p>

                <div className="shade-list flex flex-col gap-1 max-h-[480px] overflow-y-auto rounded-xl border border-white/[0.04] bg-black/20 p-1">
                  {filteredShades.length === 0 ? (
                    <div className="p-4 text-xs text-slate-600">No shades match this view.</div>
                  ) : (
                    filteredShades.map(item => {
                      const active = selectedShade?.sku === item.sku;
                      return (
                        <button
                          key={item.sku}
                          className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl border text-left w-full cursor-pointer transition-all duration-300 bg-transparent ${
                            active
                              ? "border-white/30 bg-white/[0.05]"
                              : "border-transparent hover:border-white/10 hover:bg-white/[0.02]"
                          }`}
                          onClick={() => setSelectedSku(item.sku)}
                        >
                          <div className="w-8 h-8 rounded-[10px] flex-shrink-0 border border-white/10 relative overflow-hidden" style={{ background: item.colorHex }}>
                            {item.primaryImage ? (
                              <img src={item.primaryImage} alt={formatShadeDisplayName(item.name)} className="w-full h-full object-cover rounded-[inherit]" />
                            ) : (
                              <div className="absolute top-0 left-0 w-[70%] h-[55%] bg-gradient-to-br from-white/20 to-transparent rounded-tl-[10px]" />
                            )}
                            {active && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                                <Check size={14} strokeWidth={3} className="text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-medium truncate transition-colors ${active ? "text-white" : "text-slate-500"}`}>
                              {formatShadeDisplayName(item.name)}
                            </div>
                            <div className="text-[10px] text-slate-600 mt-0.5 tracking-wide font-mono">{item.sku}</div>
                          </div>
                          <div className={`text-[11px] font-mono flex-shrink-0 ${active ? "text-slate-300" : "text-slate-700"}`}>
                            {isApproved ? `$${(item.price / 100).toFixed(0)}` : isPending ? (
                              <span className="text-[9px] text-amber-400/60 italic">Pending</span>
                            ) : (
                              <Lock size={10} className="text-indigo-400/60" />
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {selectedShade && (
                  <div className="mt-4 p-5 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs uppercase tracking-[0.3em] text-ns-accent font-bold">Selected</span>
                      <span className="text-[11px] font-mono text-slate-600">{selectedShade.sku}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-white">{formatShadeDisplayName(selectedShade.name)}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{groupLabel(selectedShade.group)} family</div>
                      </div>
                      <span className="text-sm font-mono text-slate-300">
                        {isApproved ? `$${(selectedShade.price / 100).toFixed(0)}` : isPending ? (
                          <PendingLabel className="text-xs" />
                        ) : (
                          <PricingLoginPrompt className="text-xs" />
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>

      <section className="px-4 sm:px-6 lg:px-12 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-ns-accent mb-4">Engineered Excellence</p>
            <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">Performance That Drives Satisfaction</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: "Impact Resistance", label: "Surface Defense", id: "IMP-01", desc: "Engineered to absorb impact from road debris and stone chips, keeping your paint pristine under real world driving conditions.", shimmer: "rgba(99,102,241,0.08)" },
              { icon: Flame, title: "Self Healing Technology", label: "Thermal Repair", id: "SLF-02", desc: "Minor scratches on the film's surface disappear with heat, restoring a flawless finish without any manual intervention.", shimmer: "rgba(167,139,250,0.08)" },
              { icon: Eye, title: "Clarity & Durability", label: "Optical Purity", id: "CLR-03", desc: "Highly transparent with anti yellowing formulation, ensuring the original paint color remains vibrant for years.", shimmer: "rgba(56,189,248,0.08)" },
              { icon: Droplets, title: "Stain & Corrosion Resistance", label: "Hydrophobic Shield", id: "STN-04", desc: "The hydrophobic surface repels stains from bird droppings, tree sap, and other environmental contaminants on contact.", shimmer: "rgba(52,211,153,0.08)" },
            ].map((benefit, i) => (
              <div
                key={i}
                className="glass-card-tpu p-8 sm:p-10 rounded-3xl group hover:border-white/30 transition-all duration-500 relative overflow-hidden flex flex-col border border-white/5 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="absolute top-6 right-6 sm:top-8 sm:right-8 text-[9px] font-bold text-slate-700 group-hover:text-slate-400 transition-colors duration-300 uppercase tracking-[0.3em]">
                  {benefit.id}
                </div>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: `radial-gradient(circle at 100% 0%, ${benefit.shimmer} 0%, transparent 80%)` }}
                />
                <div className="relative z-10 flex-grow">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-white/10 group-hover:scale-110 transition-all duration-500 mb-8">
                    <benefit.icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div className="mb-5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-ns-accent mb-2">{benefit.label}</p>
                    <h4 className="text-xl sm:text-2xl font-light text-white tracking-tight">{benefit.title}</h4>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed font-light group-hover:text-slate-300 transition-colors duration-300">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-12 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-ns-accent mb-4">Material Science</p>
            <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">The Technology Behind Our Film</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Layers,
                title: "Premium TPU Substrate",
                id: "MAT-01",
                risk: "Made with low grade TPH or aromatic TPU, causing haze and poor impact absorption. Unstable material leads to shrinkage and difficult installation.",
                advantage: "Utilizes aliphatic grade TPU substrate, ensuring superior impact resistance, lasting optical clarity, and dimensional stability that prevents shrinkage.",
                shimmer: "rgba(167,139,250,0.08)",
              },
              {
                icon: Pipette,
                title: "Optical Grade Adhesive System",
                id: "MAT-02",
                risk: "Low quality adhesive fails under heat, causing bubbling and lifting. It often leaves behind stubborn residue and can potentially damage the clear coat.",
                advantage: "Engineered with an automotive grade PSA that ensures a strong, bubble free bond and guarantees zero lifting or damage to the factory paint upon removal.",
                shimmer: "rgba(99,102,241,0.08)",
              },
              {
                icon: Sparkles,
                title: "Advanced Self Healing Top Coat",
                id: "MAT-03",
                risk: "Lacks an effective top coat, leaving the surface vulnerable to swirl marks and permanent stains, quickly leading to a dull, damaged appearance.",
                advantage: "Features a proprietary self healing top coat that instantly repairs fine scratches. Its dense structure also provides excellent resistance to chemical and environmental etching.",
                shimmer: "rgba(56,189,248,0.08)",
              },
            ].map((tech, i) => (
              <div
                key={i}
                className="glass-card-tpu rounded-3xl p-8 sm:p-10 border border-white/5 hover:border-white/20 transition-all duration-500 relative overflow-hidden group"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: `radial-gradient(circle at 100% 0%, ${tech.shimmer} 0%, transparent 80%)` }}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-white/10 transition-all duration-500">
                      <tech.icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-700 group-hover:text-slate-400 transition-colors duration-300 uppercase tracking-[0.3em]">{tech.id}</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-light text-white tracking-tight mb-8">{tech.title}</h4>
                  <div className="space-y-6">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-500/80 mb-1.5">Risk of Inferior Films</p>
                        <p className="text-sm text-slate-500 leading-relaxed font-light">{tech.risk}</p>
                      </div>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-500/80 mb-1.5">Our Advantage</p>
                        <p className="text-sm text-slate-500 leading-relaxed font-light group-hover:text-slate-300 transition-colors duration-300">{tech.advantage}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ padding:'64px 24px', borderTop:'1px solid rgba(255,255,255,0.04)', opacity:0.6, transition:'opacity 0.3s', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center' }} onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}>
        <div style={{ fontSize:14, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'var(--color-ns-light)', marginBottom:32 }}>NanoShield</div>
        <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'24px 40px', marginBottom:32 }}>
          <a href="#" style={{ fontSize:12, fontWeight:500, color:'var(--color-ns-body)', textDecoration:'none' }}>Contact Us</a>
          <a href="#" style={{ fontSize:12, fontWeight:500, color:'var(--color-ns-body)', textDecoration:'none' }}>Privacy Policy</a>
          <a href="#" style={{ fontSize:12, fontWeight:500, color:'var(--color-ns-body)', textDecoration:'none' }}>Terms &amp; Conditions</a>
          <a href="#" style={{ fontSize:12, fontWeight:500, color:'var(--color-ns-body)', textDecoration:'none' }}>Affiliate Agreement</a>
          <a href="#" style={{ fontSize:12, fontWeight:500, color:'var(--color-ns-body)', textDecoration:'none' }}>SMS Consent</a>
          <a href="#" style={{ fontSize:12, fontWeight:500, color:'var(--color-ns-body)', textDecoration:'none' }}>Cookie Policy</a>
        </div>
        <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--color-ns-subtle)' }}>© {new Date().getFullYear()} NanoShield. All rights reserved.</div>
      </footer>
    </div>
  );
}
