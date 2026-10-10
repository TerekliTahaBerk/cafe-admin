import { HomePage, homeMetadata } from "@/components/site/home-page";
export const revalidate = 300;
export const generateMetadata = () => homeMetadata();
export default function Page() { return <HomePage />; }
