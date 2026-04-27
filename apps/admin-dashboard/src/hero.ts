// hero.ts
import { heroui } from"@heroui/react";
export default heroui(
 {
 themes: {
 light: {
 // ...
 colors: {
 primary:"#EF950A",
 danger:"#CA0000",
 // ألوان semantic أخرى إذا تحتاج
 },
 },
 dark: {
 // ...
 colors: {
 primary:"#EF950A",
 danger:"#CA0000",
 },
 },
 // ... custom themes
 },
 }
);