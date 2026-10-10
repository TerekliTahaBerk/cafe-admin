import { MenuPage, menuMetadata } from "@/components/menu/menu-page";
export const revalidate = 300;
export const generateMetadata = () => menuMetadata();
export default function Page() { return <MenuPage />; }
